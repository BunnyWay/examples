"use client";

import { useEffect, useRef, useState } from "react";
import * as tus from "tus-js-client";
import type { UploadCredentials } from "@/lib/bunny-stream";
import { UploadedVideo } from "./uploaded-video";

type UploadState =
  | { phase: "idle" }
  | { phase: "uploading" | "paused"; title: string; percent: number; resumed: boolean }
  | { phase: "done"; title: string; videoId: string }
  | { phase: "error"; message: string };

// Remembers which Bunny video a file was going into, so a reload can resume it.
const videoKey = (file: File) => `bunny-video:${file.name}:${file.size}:${file.lastModified}`;

async function requestUpload(title: string, videoId: string | null): Promise<UploadCredentials> {
  const response = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, videoId }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Could not create the upload");

  return body;
}

export function VideoUploader() {
  const uploadRef = useRef<tus.Upload | null>(null);
  const [state, setState] = useState<UploadState>({ phase: "idle" });

  // Stop sending chunks if the component goes away mid-upload.
  useEffect(() => () => void uploadRef.current?.abort(), []);

  async function start(file: File) {
    const title = file.name;
    const key = videoKey(file);
    const savedVideoId = localStorage.getItem(key);
    setState({ phase: "uploading", title, percent: 0, resumed: false });

    let credentials: UploadCredentials;
    try {
      credentials = await requestUpload(title, savedVideoId);
    } catch (error) {
      setState({ phase: "error", message: (error as Error).message });
      return;
    }
    localStorage.setItem(key, credentials.videoId);

    let resumed = false;
    const upload = new tus.Upload(file, {
      endpoint: "https://video.bunnycdn.com/tusupload",
      retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
      removeFingerprintOnSuccess: true,
      headers: {
        AuthorizationSignature: credentials.signature,
        AuthorizationExpire: String(credentials.expirationTime),
        VideoId: credentials.videoId,
        LibraryId: credentials.libraryId,
      },
      metadata: { filetype: file.type, title },
      onProgress(bytesSent, bytesTotal) {
        const percent = Math.floor((bytesSent / bytesTotal) * 100);
        setState((current) => (current.phase === "paused" ? current : { phase: "uploading", title, percent, resumed }));
      },
      onSuccess() {
        localStorage.removeItem(key);
        setState({ phase: "done", title, videoId: credentials.videoId });
      },
      onError(error) {
        setState({ phase: "error", message: error.message });
      },
    });
    uploadRef.current = upload;

    // The stored upload URL belongs to one video. Only resume when the server
    // re-signed that same video, otherwise start over in the new one.
    const previous = await upload.findPreviousUploads();
    if (credentials.videoId === savedVideoId && previous[0]) {
      upload.resumeFromPreviousUpload(previous[0]);
      resumed = true;
    }
    upload.start();
  }

  function pause() {
    uploadRef.current?.abort();
    setState((current) => (current.phase === "uploading" ? { ...current, phase: "paused" } : current));
  }

  function resume() {
    uploadRef.current?.start();
    setState((current) => (current.phase === "paused" ? { ...current, phase: "uploading" } : current));
  }

  function reset() {
    uploadRef.current?.abort();
    uploadRef.current = null;
    setState({ phase: "idle" });
  }

  if (state.phase === "idle") {
    return (
      <label className="dropzone">
        <span>Choose a video to upload</span>
        <input
          type="file"
          accept="video/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) start(file);
          }}
        />
      </label>
    );
  }

  if (state.phase === "error") {
    return (
      <div>
        <p className="error">{state.message}</p>
        <div className="controls">
          <button type="button" onClick={reset}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "done") {
    return (
      <div>
        <UploadedVideo videoId={state.videoId} title={state.title} />
        <div className="controls">
          <button type="button" onClick={reset}>
            Upload another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p>
        {state.phase === "paused" ? "Paused" : "Uploading"} {state.title}
        {state.resumed ? " (resumed from a previous session)" : ""}
      </p>
      <progress max={100} value={state.percent} />
      <div className="controls">
        {state.phase === "uploading" ? (
          <button type="button" onClick={pause}>
            Pause
          </button>
        ) : (
          <button type="button" onClick={resume}>
            Resume
          </button>
        )}
        <button type="button" onClick={reset}>
          Cancel
        </button>
        <span className="time">{state.percent}%</span>
      </div>
    </div>
  );
}
