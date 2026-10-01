# Bunny Storage examples

These examples talk to [Bunny Storage](https://docs.bunny.net/storage) through its [S3-compatible API](https://docs.bunny.net/storage/s3), which is in public preview. Each one needs a storage zone created with S3 compatibility switched on, plus the zone name, password, and region in `.env`.

| Example | What it shows |
| --- | --- |
| [`s3-presigned-upload-nextjs`](s3-presigned-upload-nextjs) | Next.js signs a PUT URL, and the browser uploads straight to the zone |
| [`s3-uppy-multipart-react`](s3-uppy-multipart-react) | Uppy uploads large files in parts, with each request signed by a Bun server |
| [`s3-bun`](s3-bun) | Bun's built-in S3 client writes, lists, signs, and deletes files |
