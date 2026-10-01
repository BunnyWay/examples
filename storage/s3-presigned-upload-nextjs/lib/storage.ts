import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

export function isConfigured(): boolean {
  return Boolean(process.env.BUNNY_STORAGE_ZONE && process.env.BUNNY_STORAGE_PASSWORD);
}

let client: S3Client | undefined;

// The storage zone doubles as the bucket name in every S3 call.
export function bucket(): string {
  const zone = process.env.BUNNY_STORAGE_ZONE;
  if (!zone) throw new Error("Set BUNNY_STORAGE_ZONE in .env.local");

  return zone;
}

export function storage(): S3Client {
  const password = process.env.BUNNY_STORAGE_PASSWORD;
  if (!password) throw new Error("Set BUNNY_STORAGE_PASSWORD in .env.local");
  const region = process.env.BUNNY_STORAGE_REGION ?? "de";

  client ??= new S3Client({
    region,
    endpoint: `https://${region}-s3.storage.bunnycdn.com`,
    forcePathStyle: true,
    credentials: { accessKeyId: bucket(), secretAccessKey: password },
    // The AWS SDK adds a CRC32 checksum to uploads by default, and a presigned
    // URL would then expect the browser to send it. Only add one when required.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  return client;
}
