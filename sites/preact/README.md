# Preact CLI on Bunny Storage

A `preact-cli` project with `preact-router`, served from Bunny Storage through Bunny CDN. `preact-cli` is no longer developed, so this example is for existing apps. Start new Preact apps with [Vite](../vite).

```bash
bun install
bun dev
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

The CLI detects `preact-cli`, runs `bun run build`, uploads `build`, and serves `index.html` for client-side routes such as `/profile/jamie`. Read the full guide at [docs.bunny.net](https://docs.bunny.net/storage/static-site-hosting/preact).

## Bunny Optimizer (optional)

[`src/components/bunny-image.js`](src/components/bunny-image.js) renders a plain `<img>` by default, and [`.env`](.env) sets the flag to `false` so the build drops the Optimizer code. Build with `PREACT_APP_BUNNY_OPTIMIZER=true` and it adds a `srcset` of `?width=` URLs from 640 to 1920 pixels wide, so [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) resizes the image at the edge.

```bash
bunny sites deploy --build --env PREACT_APP_BUNNY_OPTIMIZER=true
```

Optimizer is a paid add-on. Turn it on for the site's pull zone, with the Dynamic Image API and URL Query String vary enabled, and CSS and JavaScript minification off. With the flag on but Optimizer off, the images still load at full size.
