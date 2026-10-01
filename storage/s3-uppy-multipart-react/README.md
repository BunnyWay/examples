# Multipart uploads to Bunny Storage with Uppy

A React app that uploads large files to a Bunny Storage zone in parts with [Uppy](https://uppy.io) and its S3 plugin. A small `Bun.serve` backend signs each S3 request, and the browser sends the bytes straight to Bunny.

```bash
cp .env.example .env
bun install
bun dev
```

Set `BUNNY_STORAGE_ZONE`, `BUNNY_STORAGE_PASSWORD`, and `BUNNY_STORAGE_REGION` in `.env`, then open http://localhost:3000 and drop in a file over 100 MB to see it go up in parts.

All three values are on the storage zone's **Access** tab. S3 compatibility is in public preview, and you can only switch it on when you create a zone, so tick **S3 Compatibility** on a new zone if your existing one doesn't have it. The password can write to the whole zone, so it stays on the server and `.env` is gitignored.

## How the signing works

Uppy 6 asks for one function, `signRequest`, and calls it before every S3 request it makes. For a file under 100 MB that's a single PUT. Over 100 MB, it's the requests that start a multipart upload, send each part, list parts, and complete or abort the upload.

[`src/App.tsx`](src/App.tsx) forwards each request to `/api/sign`. [`src/index.ts`](src/index.ts) matches it to the AWS SDK command, presigns that for an hour, and returns the URL. The server also picks the object key, so every upload lands under `uploads/` with a random folder, and it rejects requests for keys outside that prefix.

The Bunny Storage S3 endpoint allows every origin and exposes the `ETag` header. Uppy reads the ETag of each part to complete the upload, so this works with no CORS setup on your side. When an upload finishes, the page lists the key, the size, and how many parts it took.

The S3 client sets `requestChecksumCalculation: "WHEN_REQUIRED"`. The AWS SDK adds a CRC32 checksum to uploads by default, and a presigned URL would then expect the browser to send one.

Bunny Storage allows up to 10,000 parts per upload, and an unfinished multipart session expires after 10 days. Uppy aborts the session if you cancel, which deletes the parts already uploaded.

The signing route has no auth check, so anyone who can reach it can write to `uploads/` in your zone. Put it behind your own sign-in before you deploy.

## Docs

[S3 compatibility](https://docs.bunny.net/storage/s3) lists the supported multipart operations and limits. Uppy's [AWS S3 plugin docs](https://uppy.io/docs/aws-s3/) cover `signRequest` and the multipart options.
