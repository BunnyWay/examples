# Bunny Storage with Bun's S3 client

Two scripts that use the S3 client built into Bun to write, list, sign, and delete files in a Bunny Storage zone. No SDK to install.

```bash
cp .env.example .env
bun install
bun start
```

Fill in `.env` from the storage zone's **Access** tab. The zone name goes in both `S3_ACCESS_KEY_ID` and `S3_BUCKET`, and the password goes in `S3_SECRET_ACCESS_KEY`. Bun picks these up on its own, so `import { s3 } from "bun"` is already pointed at your zone.

## The scripts

`bun start` runs [`roundtrip.ts`](roundtrip.ts). It writes a small file, lists it, fetches it back through a presigned URL, then deletes it.

[`upload.ts`](upload.ts) uploads one of your own files to `uploads/` and prints a download link:

```bash
bun upload ./video.mp4
```

## Docs

- [S3 compatibility](https://docs.bunny.net/storage/s3)
- [Bun S3 client](https://bun.com/docs/api/s3)
