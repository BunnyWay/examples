# Bunny Storage with Bun's S3 client

Two scripts that use the S3 client built into Bun to write, list, sign, and delete files in a Bunny Storage zone. No SDK to install.

```bash
cp .env.example .env
bun install
bun start
```

Fill in `.env` first. Bun reads `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION`, and `S3_ENDPOINT` on its own, so `import { s3 } from "bun"` is already pointed at your zone.

The values are on the storage zone's **Access** tab. The zone name goes in both `S3_ACCESS_KEY_ID` and `S3_BUCKET`, and the password goes in `S3_SECRET_ACCESS_KEY`. S3 compatibility is in public preview and can only be switched on when you create a zone. The password can write to the whole zone, so `.env` is gitignored.

## The scripts

`bun start` runs [`roundtrip.ts`](roundtrip.ts). It writes a small text file under `examples/`, lists that folder, and fetches the file back through a presigned URL. Then it deletes the file and confirms it's gone.

To send one of your own files, pass its path to [`upload.ts`](upload.ts). It uploads the file to `uploads/` and prints a download link that works for an hour:

```bash
bun upload ./video.mp4
```

For large files, Bun streams the upload in parts, so the same command handles a text file and a multi-gigabyte video.

## Docs

[S3 compatibility](https://docs.bunny.net/storage/s3) lists the supported operations and regions. Bun's [S3 docs](https://bun.com/docs/api/s3) cover the rest of the client.
