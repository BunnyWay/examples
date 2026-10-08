# Vue on Bunny Storage

A Vue app created with `create-vue` and Vue Router in history mode, served from Bunny Storage through Bunny CDN.

```bash
bun install
bun dev
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

The CLI detects Vite, runs `bun run build`, uploads `dist`, and serves `index.html` for client-side routes such as `/about`. Read the full guide at [docs.bunny.net](https://docs.bunny.net/storage/static-site-hosting/vue).

## Bunny Optimizer (optional)

[`src/components/BunnyImage.vue`](src/components/BunnyImage.vue) renders a plain `<img>` by default. Build with `VITE_BUNNY_OPTIMIZER=true` and it adds a `srcset` of `?width=` URLs from 640 to 1920 pixels wide, so [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) resizes the image at the edge.

```bash
bunny sites deploy --build --env VITE_BUNNY_OPTIMIZER=true
```

Optimizer is a paid add-on. Turn it on for the site's pull zone, with the Dynamic Image API and URL Query String vary enabled, and CSS and JavaScript minification off. With the flag on but Optimizer off, the images still load at full size.
