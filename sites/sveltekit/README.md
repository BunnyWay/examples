# SvelteKit on Bunny Storage

A SvelteKit app prerendered with `@sveltejs/adapter-static` and served from Bunny Storage through Bunny CDN. Every route is written as a folder with an `index.html`, so `/about` works without a rewrite.

```bash
bun install
bun dev
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

The bunny.net CLI detects SvelteKit with `adapter-static`, runs `bun run build`, and uploads `build`.

## Bunny Optimizer (optional)

The home page renders its image through [`BunnyImage.svelte`](src/lib/BunnyImage.svelte). By default that is a plain `<img>`. Set `PUBLIC_BUNNY_OPTIMIZER=true` at build time (it is declared in [`src/env.ts`](src/env.ts)) and it emits a `srcset` of `?width=` URLs instead, so [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) resizes the image at the edge.

```bash
bunny sites deploy --build --env PUBLIC_BUNNY_OPTIMIZER=true
```

Optimizer is a paid add-on that `bunny sites create` leaves off. Open the pull zone under **CDN → Pull Zones**, enable Optimizer, and turn on the Dynamic Image API. Turn on **URL Query String** under **Caching → General** so each width gets its own cache entry, and turn off CSS and JS minification, because Vite has already minified both. With the flag on but Optimizer off, the images still load at full size.

See [Deploy SvelteKit to Bunny Storage](https://docs.bunny.net/storage/static-site-hosting/sveltekit) for the full guide.
