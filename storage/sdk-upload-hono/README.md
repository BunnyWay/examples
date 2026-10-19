# Upload to Bunny Storage with the SDK and Hono

A [Hono](https://hono.dev) app on Bun that takes a file from a form and writes it to a Bunny Storage zone with the [TypeScript SDK](https://docs.bunny.net/storage/typescript-sdk). The page lists everything in `uploads/` with links through your pull zone.

```bash
cp .env.example .env
bun install
bun dev
```

Fill in `.env` from the storage zone's **Access** tab, set `BUNNY_PULL_ZONE_URL` to a pull zone connected to the zone, then open http://localhost:3000 and choose a file.

## How it works

[`src/index.tsx`](src/index.tsx) connects to the zone once with `connect_with_accesskey`. `POST /upload` reads the form, checks the size, and streams the file to `/uploads/` with `BunnyStorageSDK.file.upload`, so the file never sits in memory as a whole. `GET /` lists the folder with `BunnyStorageSDK.file.list`.

This example works with any storage zone, with or without S3 compatibility. To upload straight from the browser, see the [presigned upload example](../s3-presigned-upload-nextjs).

The upload route has no auth check. Put it behind your own sign-in before you deploy.

## Docs

- [Accept user uploads](https://docs.bunny.net/storage/guides/accept-user-uploads)
- [TypeScript SDK](https://docs.bunny.net/storage/typescript-sdk)
- [Hono on Bun](https://hono.dev/docs/getting-started/bun)
