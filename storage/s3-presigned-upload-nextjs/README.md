# Upload to Bunny Storage with a presigned URL

A Next.js app where the server signs an S3 PUT URL and the browser uploads the file straight to a Bunny Storage zone. The page lists everything in `uploads/` with download links.

```bash
cp .env.example .env.local
bun install
bun dev
```

Set `BUNNY_STORAGE_ZONE`, `BUNNY_STORAGE_PASSWORD`, and `BUNNY_STORAGE_REGION` in `.env.local`, then open http://localhost:3000 and choose a file.

All three values are on the storage zone's **Access** tab. S3 compatibility is in public preview, and you can only switch it on when you create a zone, so tick **S3 Compatibility** on a new zone if your existing one doesn't have it. The password can write to the whole zone, so it stays on the server and `.env` is gitignored.

## What happens during an upload

1. The browser sends the file's name, type, and size to `/api/uploads`. The server checks the size and picks a key under `uploads/`. It then signs a PUT with the AWS SDK, valid for ten minutes.
2. The browser PUTs the file to the signed URL with `XMLHttpRequest`, which reports upload progress. The `Content-Type` header has to match the one the URL was signed with.
3. The page refreshes, and the server lists `uploads/` with a presigned GET link for each object, valid for an hour.

The Bunny Storage S3 endpoint answers every origin with `Access-Control-Allow-Origin: *`, so the browser can upload with no CORS setup on your side.

## Where the code lives

- [`lib/storage.ts`](lib/storage.ts): The S3 client, pointed at `https://<region>-s3.storage.bunnycdn.com` with path-style URLs. The storage zone name is both the access key ID and the bucket.
- [`app/api/uploads/route.ts`](app/api/uploads/route.ts): Signs the PUT.
- [`components/file-uploader.tsx`](components/file-uploader.tsx): Uploads the file and shows progress and errors.
- [`app/page.tsx`](app/page.tsx): Lists the uploads and signs the download links.

The client sets `requestChecksumCalculation: "WHEN_REQUIRED"`. The AWS SDK adds a CRC32 checksum to uploads by default, and a presigned URL would then expect the browser to send one.

A single PUT suits files up to 100 MB, which is where Bunny recommends switching to multipart. The [Uppy multipart example](../s3-uppy-multipart-react) handles bigger files.

The upload route has no auth check, so anyone who can reach it can write to `uploads/` in your zone. Put it behind your own sign-in before you deploy.

## Docs

[S3 compatibility](https://docs.bunny.net/storage/s3) lists the supported operations, limits, and error codes.
