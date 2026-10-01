import AwsS3, { type AwsBody } from "@uppy/aws-s3";
import Uppy from "@uppy/core";
import { useUppyEvent } from "@uppy/react";
import Dashboard from "@uppy/react/dashboard";
import { useRef, useState } from "react";
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import "./index.css";

type Uploaded = { id: string; name: string; key: string; size: number; parts: number };

function createUppy() {
  return new Uppy<Record<string, never>, AwsBody>().use(AwsS3, {
    // Uppy calls this for every S3 request: single PUTs for small files, and
    // create, part, list, complete, and abort requests for multipart uploads.
    async signRequest(request) {
      const response = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Could not sign the request");

      return body;
    },
    // Uppy's default is multipart above 100 MB, matching Bunny's recommendation.
    shouldUseMultipart: (file) => (file.size ?? 0) > 100 * 1024 * 1024,
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function App() {
  const [uppy] = useState(createUppy);
  const parts = useRef(new Map<string, number>());
  const [uploaded, setUploaded] = useState<Uploaded[]>([]);

  useUppyEvent(uppy, "s3-multipart:part-uploaded", (file) => {
    parts.current.set(file.id, (parts.current.get(file.id) ?? 0) + 1);
  });

  useUppyEvent(uppy, "upload-success", (file, response) => {
    if (!file) return;
    const key = response.body?.key ?? "";
    setUploaded((current) => [
      ...current,
      { id: file.id, name: file.name ?? key, key, size: file.size ?? 0, parts: parts.current.get(file.id) ?? 0 },
    ]);
  });

  return (
    <main>
      <h1>Multipart uploads to Bunny Storage with Uppy</h1>
      <p>
        Files over 100 MB go up in parts, straight from the browser to your storage zone. The server
        signs each request, so the zone password stays on the server.
      </p>

      <Dashboard uppy={uppy} proudlyDisplayPoweredByUppy={false} height={360} width="100%" />

      {uploaded.length > 0 ? (
        <>
          <h2>Uploaded</h2>
          <ul className="files">
            {uploaded.map((file) => (
              <li key={file.id}>
                <code>{file.key}</code>
                <span>
                  {formatBytes(file.size)}, {file.parts > 0 ? `${file.parts} parts` : "single PUT"}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </main>
  );
}
