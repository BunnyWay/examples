import Uppy from "@uppy/core";
import { useUppyEvent } from "@uppy/react";
import Dashboard from "@uppy/react/dashboard";
import Tus from "@uppy/tus";
import { useEffect, useState } from "react";
import type { UploadCredentials } from "./index";
import { UploadedVideo } from "./uploaded-video";
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import "./index.css";

// Bunny Stream reads `filetype` and `title` from the TUS metadata. The signed
// credentials live on the file's meta too, but are sent as headers.
type Meta = { filetype?: string; title?: string } & Partial<UploadCredentials>;

async function requestUpload(title: string): Promise<UploadCredentials> {
  const response = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Could not create the upload");

  return body;
}

function createUppy() {
  return new Uppy<Meta, Record<string, never>>({
    restrictions: { allowedFileTypes: ["video/*"] },
  }).use(Tus, {
    endpoint: "https://video.bunnycdn.com/tusupload",
    retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
    allowedMetaFields: ["filetype", "title"],
    removeFingerprintOnSuccess: true,
    headers: (file) => ({
      AuthorizationSignature: String(file.meta.signature),
      AuthorizationExpire: String(file.meta.expirationTime),
      VideoId: String(file.meta.videoId),
      LibraryId: String(file.meta.libraryId),
    }),
  });
}

export function App() {
  const [uppy] = useState(createUppy);
  const [videos, setVideos] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    // Runs when the upload starts: create a video and sign it for each file.
    const sign = async (fileIDs: string[]) => {
      await Promise.all(
        fileIDs.map(async (id) => {
          const file = uppy.getFile(id);
          const title = file.name ?? "Untitled video";
          try {
            const credentials = await requestUpload(title);
            uppy.setFileMeta(id, { filetype: file.type, title, ...credentials });
          } catch (error) {
            uppy.info((error as Error).message, "error", 10_000);
            throw error;
          }
        }),
      );
    };

    uppy.addPreProcessor(sign);

    return () => {
      uppy.removePreProcessor(sign);
    };
  }, [uppy]);

  useUppyEvent(uppy, "upload-success", (file) => {
    const videoId = file?.meta.videoId;
    if (!videoId) return;
    setVideos((current) => [...current, { id: String(videoId), title: file.name ?? "" }]);
  });

  return (
    <main>
      <h1>Upload to Bunny Stream with Uppy</h1>
      <p>
        Uppy sends each file to Bunny Stream over TUS. The server creates the video and signs the
        upload, so the API key never reaches the browser.
      </p>

      <Dashboard uppy={uppy} proudlyDisplayPoweredByUppy={false} height={360} width="100%" />

      {videos.length > 0 ? (
        <section className="videos">
          <h2>Uploaded</h2>
          {videos.map((video) => (
            <UploadedVideo key={video.id} videoId={video.id} title={video.title} />
          ))}
        </section>
      ) : null}
    </main>
  );
}
