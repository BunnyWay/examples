# VitePress on Bunny Storage

The VitePress starter, with the docs in a `docs` folder, built to static HTML and served from Bunny Storage through Bunny CDN.

```bash
bun install
bun run docs:dev
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

`vitepress init` names the build script `docs:build` and writes the output to `docs/.vitepress/dist`, so [`bunny.jsonc`](bunny.jsonc) sets both for the CLI. `cleanUrls` stays off, so every page builds to an `.html` file that its links point to.

Read the guide: [Deploy VitePress to Bunny Storage](https://docs.bunny.net/storage/static-site-hosting/vitepress)

## Bunny Optimizer (optional)

[`docs/.vitepress/components/BunnyImage.vue`](docs/.vitepress/components/BunnyImage.vue) renders a plain `<img>` by default. Build with `VITE_BUNNY_OPTIMIZER=true` and it adds a `srcset` of `?width=` URLs from 640 to 1920 pixels wide, so [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) resizes the image at the edge.

```bash
bunny sites deploy --build --env VITE_BUNNY_OPTIMIZER=true
```

Optimizer is a paid add-on. Turn it on for the site's pull zone, with the Dynamic Image API and URL Query String vary enabled, and CSS and JavaScript minification off. With the flag on but Optimizer off, the images still load at full size.
