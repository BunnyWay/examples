# Upload to Bunny Storage with a presigned URL

A Next.js app where the server signs an S3 PUT URL and the browser uploads the file straight to a Bunny Storage zone. The page lists everything in `uploads/` with download links.

```bash
cp .env.example .env.local
bun install
bun dev
```

Set `BUNNY_STORAGE_ZONE`, `BUNNY_STORAGE_PASSWORD`, and `BUNNY_STORAGE_REGION` from the storage zone's **Access** tab, then open http://localhost:3000 and choose a file.

## Where the code lives

- [`lib/storage.ts`](lib/storage.ts): The S3 client, pointed at your zone.
- [`app/api/uploads/route.ts`](app/api/uploads/route.ts): Signs the PUT.
- [`components/file-uploader.tsx`](components/file-uploader.tsx): Uploads the file and shows progress.
- [`app/page.tsx`](app/page.tsx): Lists the uploads and signs the download links.

The client sets `requestChecksumCalculation: "WHEN_REQUIRED"`, otherwise the AWS SDK expects the browser to send a checksum with the presigned upload.

For larger files, see the [Uppy multipart example](../s3-uppy-multipart-react).

The upload route has no auth check. Put it behind your own sign-in before you deploy.

## Docs

- [S3 compatibility](https://docs.bunny.net/storage/s3)
