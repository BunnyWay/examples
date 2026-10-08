# Angular on Bunny Storage

An Angular app served from Bunny Storage through a pull zone.

```bash
bun install
bun start
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

The Angular builder writes the app to `dist/my-app/browser`, so [`bunny.jsonc`](bunny.jsonc) points the bunny.net CLI at that folder. The CLI detects Angular and serves `index.html` for client-side routes such as `/about`.

Read the full guide: [Deploy Angular to Bunny Storage](https://docs.bunny.net/storage/static-site-hosting/angular).

## Bunny Optimizer (optional)

By default `NgOptimizedImage` uses its built-in loader and serves the original file. Build with `BUNNY_OPTIMIZER=true` and [`src/app/app.config.ts`](src/app/app.config.ts) provides a custom `IMAGE_LOADER`, so every width in the `srcset` becomes a URL such as `/images/hero.png?width=828&quality=75` that [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) resizes at the edge. The `build` script in [`package.json`](package.json) passes the flag to `ng build --define`.

```bash
bunny sites deploy --build --env BUNNY_OPTIMIZER=true
```

Optimizer is a paid add-on. Turn it on for the site's pull zone, with the Dynamic Image API and URL Query String vary enabled, and CSS and JavaScript minification off. With the flag on but Optimizer off, the images still load at full size.
