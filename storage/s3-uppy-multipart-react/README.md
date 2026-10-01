# Multipart uploads to Bunny Storage with Uppy

A React app that uploads large files to a Bunny Storage zone in parts with [Uppy](https://uppy.io) and its S3 plugin. A small `Bun.serve` backend signs each request, and the browser sends the bytes straight to Bunny.

```bash
cp .env.example .env
bun install
bun dev
```

Set `BUNNY_STORAGE_ZONE`, `BUNNY_STORAGE_PASSWORD`, and `BUNNY_STORAGE_REGION` from the storage zone's **Access** tab, then open http://localhost:3000 and drop in a large file.

## How it works

Uppy calls `signRequest` before every S3 request it makes. [`src/App.tsx`](src/App.tsx) forwards each one to `/api/sign`, and [`src/index.ts`](src/index.ts) presigns it with the AWS SDK. The server also picks the object key, so uploads always land under `uploads/`.

The S3 client sets `requestChecksumCalculation: "WHEN_REQUIRED"`, otherwise the AWS SDK expects the browser to send a checksum with each presigned request.

The signing route has no auth check. Put it behind your own sign-in before you deploy.

## Docs

- [S3 compatibility](https://docs.bunny.net/storage/s3)
- [Uppy AWS S3 plugin](https://uppy.io/docs/aws-s3/)
