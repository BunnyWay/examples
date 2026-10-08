# Analog on Bunny Storage

An [Analog](https://analogjs.org) app with static output turned on, prerendered into `dist/analog/public` and served from Bunny Storage through Bunny CDN. Each route listed under `prerender.routes` in [`vite.config.ts`](vite.config.ts) is written as a folder with an `index.html`.

```bash
bun install
bun dev
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

The bunny.net CLI detects Analog, runs `bun run build`, and uploads `dist/analog/public`. Add new pages to `prerender.routes`, otherwise a direct visit to them returns a 404.

## Bunny Optimizer (optional)

The home page renders its image with Angular's `NgOptimizedImage`. By default it uses the built-in loader and serves the original file. Set `VITE_BUNNY_OPTIMIZER=true` at build time and [`bunny-image-loader.ts`](src/app/bunny-image-loader.ts) provides a custom `IMAGE_LOADER`, so the image gets a `srcset` of `?width=` URLs and [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) resizes it at the edge.

```bash
bunny sites deploy --build --env VITE_BUNNY_OPTIMIZER=true
```

Optimizer is a paid add-on that `bunny sites create` leaves off. Open the pull zone under **CDN → Pull Zones**, enable Optimizer, and turn on the Dynamic Image API. Turn on **URL Query String** under **Caching → General** so each width gets its own cache entry, and turn off CSS and JS minification, because Vite has already minified both. With the flag on but Optimizer off, the images still load at full size.

See [Deploy Analog to Bunny Storage](https://docs.bunny.net/storage/static-site-hosting/analog) for the full guide.
