# Next.js on Bunny Storage

A Next.js app exported as static HTML and served from Bunny Storage through Bunny CDN.

```bash
bun install
bun dev
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

The CLI detects the static export, runs `bun run build`, and uploads `out`.

[`next.config.ts`](next.config.ts) turns on `output: "export"` and `trailingSlash`, so `/about` builds to `about/index.html` and loads from storage.

Read the guide: [Deploy Next.js to Bunny Storage](https://docs.bunny.net/storage/static-site-hosting/nextjs)

## Bunny Optimizer (optional)

By default [`next.config.ts`](next.config.ts) sets `images.unoptimized`, so `next/image` serves the original file. Build with `NEXT_PUBLIC_BUNNY_OPTIMIZER=true` and it switches to the custom loader in [`lib/bunny-loader.ts`](lib/bunny-loader.ts), which adds `?width=` and `quality=` to each `srcset` URL so [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) resizes the image at the edge. See [`cdn/optimizer-nextjs-static`](../../cdn/optimizer-nextjs-static) for the full walkthrough.

```bash
bunny sites deploy --build --env NEXT_PUBLIC_BUNNY_OPTIMIZER=true
```

Optimizer is a paid add-on. Turn it on for the site's pull zone, with the Dynamic Image API and URL Query String vary enabled, and CSS and JavaScript minification off. With the flag on but Optimizer off, the images still load at full size.
