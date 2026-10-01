import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  ListPartsCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { serve } from "bun";
import index from "./index.html";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }

  return value;
}

const bucket = requireEnv("BUNNY_STORAGE_ZONE");
const region = process.env.BUNNY_STORAGE_REGION ?? "de";

const storage = new S3Client({
  region,
  endpoint: `https://${region}-s3.storage.bunnycdn.com`,
  forcePathStyle: true,
  credentials: { accessKeyId: bucket, secretAccessKey: requireEnv("BUNNY_STORAGE_PASSWORD") },
  // The AWS SDK adds a CRC32 checksum to uploads by default, and a presigned
  // URL would then expect the browser to send it. Only add one when required.
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

// What Uppy asks us to sign. See PresignableRequest in @uppy/aws-s3.
type SignRequest = {
  method: "GET" | "PUT" | "POST" | "DELETE";
  key: string;
  uploadId?: string;
  partNumber?: number;
};

const PREFIX = "uploads/";

// Presigns the S3 command behind each request Uppy makes. Parts can take a
// while on slow connections, so every URL stays valid for an hour.
function presign({ method, key, uploadId, partNumber }: SignRequest): Promise<string> | null {
  const input = { Bucket: bucket, Key: key };
  const options = { expiresIn: 3600 };

  if (method === "PUT" && uploadId && partNumber) {
    return getSignedUrl(storage, new UploadPartCommand({ ...input, UploadId: uploadId, PartNumber: partNumber }), options);
  }
  if (method === "PUT") return getSignedUrl(storage, new PutObjectCommand(input), options);
  if (method === "POST" && uploadId) {
    return getSignedUrl(storage, new CompleteMultipartUploadCommand({ ...input, UploadId: uploadId }), options);
  }
  if (method === "POST") return getSignedUrl(storage, new CreateMultipartUploadCommand(input), options);
  if (method === "GET" && uploadId) {
    return getSignedUrl(storage, new ListPartsCommand({ ...input, UploadId: uploadId }), options);
  }
  if (method === "DELETE" && uploadId) {
    return getSignedUrl(storage, new AbortMultipartUploadCommand({ ...input, UploadId: uploadId }), options);
  }

  return null;
}

// Uppy proposes a key for each new upload (a single PUT, or the POST that
// starts a multipart upload). The server replaces it with one under uploads/,
// and Uppy uses that key for every later request in the upload.
function resolveKey(request: SignRequest): string | null {
  const startsUpload = !request.uploadId && (request.method === "PUT" || request.method === "POST");
  if (startsUpload) {
    const name = request.key.split("/").pop()?.replace(/[^\w.-]+/g, "-") || "file";

    return `${PREFIX}${crypto.randomUUID()}/${name}`;
  }

  return request.key.startsWith(PREFIX) ? request.key : null;
}

const server = serve({
  routes: {
    "/*": index,

    // Signs one S3 request at a time. The browser then calls Bunny Storage
    // directly with the URL, so the password never leaves this process.
    // Add your own auth check here before you deploy this.
    "/api/sign": {
      async POST(req) {
        const request = (await req.json()) as SignRequest;
        const key = resolveKey(request);
        if (!key) return Response.json({ error: `Keys must start with ${PREFIX}` }, { status: 400 });

        const signing = presign({ ...request, key });
        if (!signing) return Response.json({ error: "Unsupported request" }, { status: 400 });

        try {
          return Response.json({ url: await signing, key });
        } catch (error) {
          return Response.json({ error: (error as Error).message }, { status: 500 });
        }
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`Server running at ${server.url}`);
