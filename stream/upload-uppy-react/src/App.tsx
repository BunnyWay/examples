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

const TUS_ENDPOINT = "https://video.bunnycdn.com/tusupload";

// Remembers which Bunny video a file was going into, so a retry or a reload
// re-signs the same video instead of creating a new one.
const videoKey = (fileId: string) => `bunny-video:${fileId}`;

function readVideoId(fileId: string): string | null {
  try {
    return localStorage.getItem(videoKey(fileId));
  } catch {
    return null;
  }
}

function writeVideoId(fileId: string, videoId: string | null) {
  try {
    if (videoId) localStorage.setItem(videoKey(fileId), videoId);
    else localStorage.removeItem(videoKey(fileId));
  } catch {
    // Storage can be unavailable, for example in a private window. Resuming just won't survive a reload.
  }
}

// Drops the TUS upload URLs stored for a file. A stored URL belongs to one
// video, so it must not be resumed with another video's credentials.
function forgetTusUploads(fileId: string) {
  try {
    const prefix = `tus::tus-${fileId}-${TUS_ENDPOINT}::`;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(prefix)) localStorage.removeItem(key);
    }
  } catch {
    // Nothing stored, so nothing to forget.
  }
}

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

function createUppy() {
  return new Uppy<Meta, Record<string, never>>({
    restrictions: { allowedFileTypes: ["video/*"] },
  }).use(Tus, {
    endpoint: TUS_ENDPOINT,
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
    // Runs when an upload starts, and again on every retry: sign a video for each file.
    const sign = async (fileIDs: string[]) => {
      await Promise.all(
        fileIDs.map(async (id) => {
          const file = uppy.getFile(id);
          const title = file.name ?? "Untitled video";
          const savedVideoId = file.meta.videoId ?? readVideoId(id);
          try {
            const credentials = await requestUpload(title, savedVideoId);
            if (credentials.videoId !== savedVideoId) {
              // A new video, so start the file from scratch rather than resume into the old one.
              forgetTusUploads(id);
              uppy.setFileState(id, { tus: { uploadUrl: null } });
            }
            writeVideoId(id, credentials.videoId);
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
    if (!file || !videoId) return;
    writeVideoId(file.id, null);
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
