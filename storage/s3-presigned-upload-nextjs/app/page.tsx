import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { connection } from "next/server";
import { FileUploader } from "@/components/file-uploader";
import { bucket, isConfigured, storage } from "@/lib/storage";

async function listUploads() {
  const { Contents = [] } = await storage().send(
    new ListObjectsV2Command({ Bucket: bucket(), Prefix: "uploads/" }),
  );
  const newestFirst = Contents.sort((a, b) => (b.LastModified?.getTime() ?? 0) - (a.LastModified?.getTime() ?? 0));

  // Objects are private, so each link is a presigned GET that works for an hour.
  return Promise.all(
    newestFirst.map(async (object) => ({
      key: object.Key!,
      name: object.Key!.split("/").pop()!,
      size: object.Size ?? 0,
      url: await getSignedUrl(storage(), new GetObjectCommand({ Bucket: bucket(), Key: object.Key }), {
        expiresIn: 3600,
      }),
    })),
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function Home() {
  // Read the environment per request, so the page never bakes in a build-time value.
  await connection();

  if (!isConfigured()) {
    return (
      <main>
        <h1>Upload to Bunny Storage over S3</h1>
        <div className="empty">
          Copy <code>.env.example</code> to <code>.env.local</code> and set{" "}
          <code>BUNNY_STORAGE_ZONE</code>, <code>BUNNY_STORAGE_PASSWORD</code>, and{" "}
          <code>BUNNY_STORAGE_REGION</code>, then restart the dev server.
        </div>
      </main>
    );
  }

  const uploads = await listUploads();

  return (
    <main>
      <h1>Upload to Bunny Storage over S3</h1>
      <p>
        The server signs a URL, and the browser PUTs the file straight to your storage zone. The
        password never leaves the server.
      </p>

      <FileUploader />

      <h2>Uploads</h2>
      {uploads.length === 0 ? (
        <p>Nothing in uploads/ yet.</p>
      ) : (
        <ul className="files">
          {uploads.map((upload) => (
            <li key={upload.key}>
              <a href={upload.url}>{upload.name}</a>
              <span>{formatBytes(upload.size)}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
