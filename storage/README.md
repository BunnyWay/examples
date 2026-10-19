# Bunny Storage examples

Runnable examples for [Bunny Storage](https://docs.bunny.net/storage). Most use the [S3-compatible API](https://docs.bunny.net/storage/s3), so they need a storage zone with S3 compatibility switched on, plus the zone name, password, and region in `.env`.

| Example | What it shows |
| --- | --- |
| [`s3-presigned-upload-nextjs`](s3-presigned-upload-nextjs) | Next.js signs a PUT URL, and the browser uploads straight to the zone |
| [`s3-uppy-multipart-react`](s3-uppy-multipart-react) | Uppy uploads large files in parts, with each request signed by a Bun server |
| [`s3-bun`](s3-bun) | Bun's built-in S3 client writes, lists, signs, and deletes files |
| [`image-gallery-nextjs`](image-gallery-nextjs) | Presigned image uploads, with Bunny Optimizer cropping and resizing the thumbnails |
| [`sdk-upload-hono`](sdk-upload-hono) | A Hono app on Bun uploads through the TypeScript SDK, with any storage zone |
| [`token-auth-edge-script`](token-auth-edge-script) | An Edge Script signs expiring download links for a pull zone with token authentication |
