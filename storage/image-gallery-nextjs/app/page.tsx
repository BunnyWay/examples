import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { connection } from "next/server";
import { FileUploader } from "@/components/file-uploader";
import { bucket, isConfigured, storage } from "@/lib/storage";

async function listImages() {
  const { Contents = [] } = await storage().send(new ListObjectsV2Command({ Bucket: bucket(), Prefix: "images/" }));

  return Contents.sort((a, b) => (b.LastModified?.getTime() ?? 0) - (a.LastModified?.getTime() ?? 0)).map(
    (object) => object.Key!,
  );
}

// Optimizer reads these query parameters and resizes the original at the edge.
function optimized(key: string, params: Record<string, string | number>): string {
  const url = new URL(key, process.env.BUNNY_PULL_ZONE_URL);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, String(value));

  return url.href;
}

export default async function Home() {
  // Read the environment per request, so the page never bakes in a build-time value.
  await connection();

  if (!isConfigured()) {
    return (
      <main>
        <h1>Image gallery on Bunny Storage</h1>
        <div className="empty">
          Copy <code>.env.example</code> to <code>.env.local</code> and set <code>BUNNY_STORAGE_ZONE</code>,{" "}
          <code>BUNNY_STORAGE_PASSWORD</code>, <code>BUNNY_STORAGE_REGION</code>, and{" "}
          <code>BUNNY_PULL_ZONE_URL</code>, then restart the dev server.
        </div>
      </main>
    );
  }

  const images = await listImages();

  return (
    <main>
      <h1>Image gallery on Bunny Storage</h1>
      <p>
        The browser uploads each original straight to your storage zone. Bunny Optimizer crops the thumbnails
        and resizes the full-size view from the same file.
      </p>

      <FileUploader />

      <h2>Images</h2>
      {images.length === 0 ? (
        <p>Nothing in images/ yet.</p>
      ) : (
        <ul className="gallery">
          {images.map((key) => (
            <li key={key}>
              <a href={optimized(key, { width: 1600 })}>
                <img
                  src={optimized(key, { width: 300, aspect_ratio: "1:1" })}
                  srcSet={`${optimized(key, { width: 600, aspect_ratio: "1:1" })} 2x`}
                  alt=""
                  width={300}
                  height={300}
                  loading="lazy"
                />
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
