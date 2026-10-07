# Astro behind a bunny.net pull zone with Bunny Optimizer

An Astro app with the Node adapter, on any host, with a bunny.net pull zone in front. A custom image service sends every `<Image>` width to [Bunny Optimizer](https://docs.bunny.net/optimizer), which resizes it at the edge, so your server never resizes an image.

```bash
bun install
bun dev
```

## Pick a setup

| Setup | What goes through the pull zone | Build with |
| --- | --- | --- |
| Assets and images only | Scripts, styles, and images | `CDN_URL` |
| Whole site | Every request | nothing extra |

Both need these on the pull zone:

1. Turn on **URL Query String** under **Caching → General**, so each `?width=` gets its own cache entry.
2. Enable Optimizer, then turn on the Dynamic Image API and automatic WebP under **Optimizer → Settings**. Turn off CSS and JS minification, because Astro has already minified both.

### Assets and images only

Create a pull zone with your app's public URL as the origin. Visitors load HTML from your host, and `build.assetsPrefix` points `/_astro` files and images at the pull zone.

- **Caching**: respect the origin's `Cache-Control`. The Node adapter sends a one-year `immutable` header on `/_astro/*`, and `max-age=0` on files in `public`, so import images from `src/assets` where you can.
- **Edge rule**: add a **Block Request** rule that triggers when the request URL matches none of `*/_astro/*` and `*/images/*`, so the pull zone doesn't serve your pages on its own hostname.

```bash
CDN_URL=https://myapp.b-cdn.net bun run build
```

### Whole site

Create a pull zone with your app's origin URL, add your public hostname to it, and point DNS at the pull zone.

- **Forms**: Astro's CSRF check reads the browser's `Sec-Fetch-Site` header, which the pull zone passes through, so form posts and actions work with no config.
- **Cookies**: turn off **Disable Cookies**. Pull zones created through the API strip `Set-Cookie` by default. Save a name on [`/cookie`](src/pages/cookie.astro) and reload to check.
- **HTML caching**: keep Smart Cache on. Astro sends no `Cache-Control` on a server-rendered page, so with Smart Cache off the pull zone caches each page for its default expiry and can hand one visitor's page to the next.

## Deploy

Run `bun run build`, deploy `dist`, and start it with `bun start`, which runs `node ./dist/server/entry.mjs`.

## Check it works

```bash
# Expect image/webp
curl -sI -H 'Accept: image/webp' 'https://myapp.b-cdn.net/images/hero.png?width=640&quality=75' | grep -i content-type
```

In the assets-only setup, the image `srcset` URLs start with your `b-cdn.net` hostname.

## How the image service works

[`src/bunny-image-service.ts`](src/bunny-image-service.ts) spreads Astro's `baseService`, so Astro still works out the `srcset` widths, and only `getURL` changes. It adds `?width=` and `?quality=` to each image on your own zone, and leaves images on other hosts alone, since Optimizer can't reach them. [`astro.config.mjs`](astro.config.mjs) passes `CDN_URL` to the service as `baseURL`.

## Other setups

- [`optimizer-astro-magic-containers`](../optimizer-astro-magic-containers): Astro on Magic Containers, where the CDN endpoint is the pull zone
- [`optimizer-astro-static`](../optimizer-astro-static): a static build on Bunny Storage
