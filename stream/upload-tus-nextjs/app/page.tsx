import { connection } from "next/server";
import { VideoUploader } from "@/components/video-uploader";
import { isConfigured } from "@/lib/bunny-stream";

export default async function Home() {
  // Read the environment per request, so the page never bakes in a build-time value.
  await connection();

  return (
    <main>
      <h1>Upload to Bunny Stream with TUS</h1>
      <p>
        The browser sends the file straight to Bunny Stream. Pause it, or reload the page halfway
        through and pick the same file to carry on.
      </p>
      {isConfigured() ? (
        <VideoUploader />
      ) : (
        <div className="empty">
          Copy <code>.env.example</code> to <code>.env.local</code> and set{" "}
          <code>BUNNY_STREAM_LIBRARY_ID</code> and <code>BUNNY_STREAM_API_KEY</code>, then restart the
          dev server.
        </div>
      )}
    </main>
  );
}
