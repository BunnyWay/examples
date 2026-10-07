# Next.js behind a bunny.net pull zone with Bunny Optimizer

A standalone Next.js App Router app that runs on any host, with a bunny.net pull zone in front. [Bunny Optimizer](https://docs.bunny.net/optimizer) resizes and converts each `next/image` request at the edge, so your server never runs `/_next/image`.

```bash
bun install
bun dev
```

## Pick a setup

The pull zone can carry your assets and images, or your whole site. Each setup has its own build-time variable, and development needs neither.

| Setup | Through the pull zone | Build with |
| --- | --- | --- |
| Assets and images only | Scripts, styles, fonts, and images | `NEXT_PUBLIC_CDN_URL` |
| Whole site | Every request | `ALLOWED_ORIGINS` |

Both setups need two things on the pull zone:

1. Turn on **URL Query String** under **Caching → General**, so each `?width=` gets its own cache entry.
2. Enable Optimizer, then turn on the Dynamic Image API and automatic WebP under **Optimizer → Settings**. Turn off CSS and JS minification, because Next has already minified both.

### Assets and images only

Create a pull zone with your app's public URL as the origin. Visitors load HTML from your host, and `assetPrefix` points every script, stylesheet, font, and image at the pull zone.

- Leave caching set to respect the origin's `Cache-Control`. Next sends year-long immutable headers on `/_next/static/*`, and Next serves `public` files with `max-age=0`, so [`next.config.ts`](next.config.ts) gives `/images/*` a one-day header.
- Turn on CORS headers for `woff2` and `woff`. `next/font` serves fonts from `/_next/static/media`, which now lives on the pull zone hostname.
- Add a **Block Request** edge rule that triggers when the URL matches none of `*/_next/static/*` and `*/images/*`. The pull zone otherwise serves your whole site on its own hostname, and Next sends `s-maxage=31536000` on static pages, so the edge could hold a year-old copy of your HTML.

```bash
NEXT_PUBLIC_CDN_URL=https://myapp.b-cdn.net bun run build
```

### Whole site

Create a pull zone with your server as the origin, add your public hostname to the pull zone, and point DNS at it.

- Set `ALLOWED_ORIGINS` to your public hostname. Browsers send it in `Origin`, Next compares it with the origin's hostname in `x-forwarded-host`, and a mismatch fails every Server Action with "Invalid Server Actions request". The variable feeds `serverActions.allowedOrigins`.
- Turn off **Disable Cookies**. Pull zones created through the API strip `Set-Cookie` by default, so a login appears to work and the session disappears on reload. Save a name on [`/cookie`](app/cookie/page.tsx) and reload the page to check.
- Decide how the edge treats HTML. Smart Cache skips HTML entirely. With Smart Cache off, Next's `s-maxage=31536000` keeps static pages at the edge for a year, so purge the pull zone on every deploy. ISR revalidation works in both modes.

```bash
ALLOWED_ORIGINS=www.example.com bun run build
```

## Deploy

The build script copies `public` and `.next/static` into `.next/standalone`. Deploy that folder and start it with `node server.js`, or run `bun start` to try it locally.

`NEXT_PUBLIC_CDN_URL` and `ALLOWED_ORIGINS` are read during `next build`, so a Docker build needs them as build args. The standalone server also binds to `HOSTNAME`, which containers set to their own name, so set `HOSTNAME=0.0.0.0` when you run it in one.

## Check it works

The network tab should show no requests to `/_next/image`. In the assets-only setup, every `<script>` tag and image `srcset` URL starts with your `b-cdn.net` hostname.

```bash
# Run twice, and look for CDN-Cache: HIT on the second request
curl -sI https://myapp.b-cdn.net/_next/static/chunks/<some-chunk>.js | grep -i cdn-cache

# Expect image/webp
curl -sI -H 'Accept: image/webp' 'https://myapp.b-cdn.net/images/hero.png?width=640&quality=75' | grep -i content-type
```

## How the loader works

[`lib/bunny-loader.ts`](lib/bunny-loader.ts) turns each `next/image` width into an Optimizer URL. The file starts with `"use client"` because the App Router serialises the loader to the browser.

The loader keeps any params already on `src`, so `src="/images/optimizer.png?aspect_ratio=1:1"` gets Optimizer's square crop on top of Next's responsive widths.

Optimizer never enlarges an image past its original size, so `srcset` widths beyond the source return the original. Optimizer defaults to quality 85, and the loader sends Next's 75 unless a component sets its own. Next 16 only accepts quality 75 by default, so list any other values in `images.qualities`.

## Before you ship

- A file in `public/images` keeps its URL when you replace it, and the pull zone serves the old copy for up to a day. Purge the pull zone after a change, or import the image with `import optimizer from "@/public/images/optimizer.png"`. Imported images get a hashed `/_next/static/media` URL that changes with the file and caches for a year.
- Only local images go through Optimizer. A remote `src` like `https://example.com/photo.jpg` comes back with `?width=` added, which most hosts ignore, so every width downloads the full file. Put remote images behind their own pull zone.
- Optimizer caps images requested without `?width=` at 1600px on desktop and 800px on mobile. `next/image` always sends a width, so the cap only applies to images you link to directly.
- A deploy removes the previous build's chunks from your server. A tab still running the old build can only fetch them from edges that cached them already, so it may need a reload.

## Other setups

- [`optimizer-nextjs-magic-containers`](../optimizer-nextjs-magic-containers): Next.js on Magic Containers, where the CDN endpoint is already a pull zone
- [`optimizer-nextjs-static`](../optimizer-nextjs-static): a static export on Bunny Storage

## Docs

- [Dynamic Image API](https://docs.bunny.net/optimizer/dynamic-images/overview)
- [`assetPrefix`](https://nextjs.org/docs/app/api-reference/config/next-config-js/assetPrefix)
- [Server Actions `allowedOrigins`](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions)
- [Custom image loaders](https://nextjs.org/docs/app/api-reference/config/next-config-js/images)
