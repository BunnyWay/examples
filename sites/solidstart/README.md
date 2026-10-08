# SolidStart on Bunny Storage

A SolidStart 2 app prerendered with Nitro's static preset and served from Bunny Storage through a pull zone.

```bash
bun install
bun dev
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

[`vite.config.ts`](vite.config.ts) sets the `static` preset and crawls links, so every page is prerendered to `.output/public`. The bunny.net CLI detects SolidStart and uploads that folder.

Nitro 3 has no stable release yet, so `nitro` is pinned to `3.0.260903-beta`. Older betas fail the static build with `rolldownOptions.input should not be an html file`.

## Bunny Optimizer (optional)

The home page renders its image through [`BunnyImage.tsx`](src/components/BunnyImage.tsx). By default that is a plain `<img>`. Set `VITE_BUNNY_OPTIMIZER=true` at build time and it emits a `srcset` of `?width=` URLs instead, so [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) resizes the image at the edge.

```bash
bunny sites deploy --build --env VITE_BUNNY_OPTIMIZER=true
```

Optimizer is a paid add-on that `bunny sites create` leaves off. Open the pull zone under **CDN → Pull Zones**, enable Optimizer, and turn on the Dynamic Image API. Turn on **URL Query String** under **Caching → General** so each width gets its own cache entry, and turn off CSS and JS minification, because Vite has already minified both. With the flag on but Optimizer off, the images still load at full size.

Read the full guide: [Deploy SolidStart to Bunny Storage](https://docs.bunny.net/storage/static-site-hosting/solidstart).
