import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { bucket, storage } from "@/lib/storage";

// A single PUT suits smaller files. For bigger ones, use a multipart upload.
const MAX_BYTES = 100 * 1024 * 1024;

// Returns a URL the browser can PUT one file to for the next ten minutes.
export async function POST(request: Request) {
  const { filename, contentType, size } = (await request.json()) as {
    filename?: unknown;
    contentType?: unknown;
    size?: unknown;
  };
  if (typeof filename !== "string" || !filename.trim()) {
    return Response.json({ error: "filename is required" }, { status: 400 });
  }
  if (typeof size !== "number" || size > MAX_BYTES) {
    return Response.json({ error: "Files must be 100 MB or smaller" }, { status: 400 });
  }

  // Prefix with a random folder so two uploads with the same name never collide.
  const key = `uploads/${crypto.randomUUID()}/${filename.replace(/[^\w.-]+/g, "-")}`;
  const type = typeof contentType === "string" && contentType ? contentType : "application/octet-stream";

  try {
    const url = await getSignedUrl(
      storage(),
      new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: type }),
      { expiresIn: 600 },
    );

    return Response.json({ url, key, contentType: type });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
