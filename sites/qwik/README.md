# Qwik on Bunny Storage

A Qwik City app prerendered with the static adapter and served from Bunny Storage through Bunny CDN. Every route is written as a folder with an `index.html`, plus a `404.html` and `sitemap.xml`.

```bash
bun install
bun dev
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

Set `origin` in [`adapters/static/vite.config.ts`](adapters/static/vite.config.ts) to the URL that `bunny sites create` prints (or your custom domain), since Qwik uses it for the URLs in `sitemap.xml`. The bunny.net CLI detects Qwik with the static adapter, runs `bun run build`, uploads `dist`, and uses `404.html` as the not-found page.

## Bunny Optimizer (optional)

The home page renders its image through [`bunny-image.tsx`](src/components/bunny-image/bunny-image.tsx). By default that is a plain `<img>`. Set `VITE_BUNNY_OPTIMIZER=true` at build time and it emits a `srcset` of `?width=` URLs instead, so [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) resizes the image at the edge.

```bash
bunny sites deploy --build --env VITE_BUNNY_OPTIMIZER=true
```

Optimizer is a paid add-on that `bunny sites create` leaves off. Open the pull zone under **CDN → Pull Zones**, enable Optimizer, and turn on the Dynamic Image API. Turn on **URL Query String** under **Caching → General** so each width gets its own cache entry, and turn off CSS and JS minification, because Vite has already minified both. With the flag on but Optimizer off, the images still load at full size.

See [Deploy Qwik to Bunny Storage](https://docs.bunny.net/storage/static-site-hosting/qwik) for the full guide.
