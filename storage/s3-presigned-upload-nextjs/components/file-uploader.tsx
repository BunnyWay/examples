"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type UploadState =
  | { phase: "idle" }
  | { phase: "uploading"; name: string; percent: number }
  | { phase: "error"; message: string };

// fetch() can't report upload progress, so the PUT goes through XMLHttpRequest.
function put(url: string, file: File, contentType: string, onProgress: (percent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    // Must match the Content-Type the URL was signed with.
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (event) => onProgress(Math.floor((event.loaded / event.total) * 100));
    xhr.onload = () => {
      if (xhr.status < 300) return resolve();
      // Bunny Storage answers with an S3 XML error. The <Message> is the useful part.
      const message = xhr.responseText.match(/<Message>(.*?)<\/Message>/)?.[1];
      reject(new Error(`Bunny Storage returned ${xhr.status}${message ? `: ${message}` : ""}`));
    };
    xhr.onerror = () => reject(new Error("The upload failed before Bunny Storage replied"));
    xhr.send(file);
  });
}

export function FileUploader() {
  const router = useRouter();
  const [state, setState] = useState<UploadState>({ phase: "idle" });

  async function upload(file: File) {
    setState({ phase: "uploading", name: file.name, percent: 0 });

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Could not sign the upload");

      await put(body.url, file, body.contentType, (percent) =>
        setState({ phase: "uploading", name: file.name, percent }),
      );
      setState({ phase: "idle" });
      router.refresh();
    } catch (error) {
      setState({ phase: "error", message: (error as Error).message });
    }
  }

  return (
    <div>
      <label className="dropzone">
        <span>{state.phase === "uploading" ? `Uploading ${state.name}` : "Choose a file to upload"}</span>
        <input
          type="file"
          disabled={state.phase === "uploading"}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) upload(file);
            event.target.value = "";
          }}
        />
      </label>
      {state.phase === "uploading" ? <progress max={100} value={state.percent} /> : null}
      {state.phase === "error" ? <p className="error">{state.message}</p> : null}
    </div>
  );
}
