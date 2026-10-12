# Image gallery with Bunny Storage and Optimizer

A Next.js app where the browser uploads images straight to a Bunny Storage zone with a presigned URL, and [Bunny Optimizer](https://docs.bunny.net/optimizer) crops and resizes every thumbnail from the original.

```bash
cp .env.example .env.local
bun install
bun dev
```

Set `BUNNY_STORAGE_ZONE`, `BUNNY_STORAGE_PASSWORD`, and `BUNNY_STORAGE_REGION` from the storage zone's **Access** tab. Set `BUNNY_PULL_ZONE_URL` to a pull zone connected to the zone, with Optimizer and the **Dynamic Image API** turned on. Then open http://localhost:3000 and add a few images.

## Where the code lives

- [`app/api/uploads/route.ts`](app/api/uploads/route.ts): Signs a PUT for one image under `images/`.
- [`components/file-uploader.tsx`](components/file-uploader.tsx): Uploads the image and shows progress.
- [`app/page.tsx`](app/page.tsx): Lists `images/` and builds the Optimizer URLs.
- [`lib/storage.ts`](lib/storage.ts): The S3 client, pointed at your zone.

Each thumbnail is the same original with `?width=300&aspect_ratio=1:1`, plus a `600` wide version for high-density screens. The full-size link asks for `?width=1600`. Storage only ever holds the original.

The upload route has no auth check. Put it behind your own sign-in before you deploy.

## Docs

- [Serve and transform images from Bunny Storage](https://docs.bunny.net/storage/guides/serve-and-transform-images)
- [Dynamic Images](https://docs.bunny.net/optimizer/dynamic-images/overview)
- [S3 compatibility](https://docs.bunny.net/storage/s3)
