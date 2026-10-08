# Eleventy on Bunny Storage

A static Eleventy site served from Bunny Storage through Bunny CDN.

```bash
bun install
bun run dev
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

The CLI detects Eleventy, runs the `build` script in [`package.json`](package.json), and uploads `_site`. Eleventy writes each page as a folder with an `index.html`, so `/about/` loads straight from storage.

Read the guide: [Deploy Eleventy to Bunny Storage](https://docs.bunny.net/storage/static-site-hosting/eleventy)

## Bunny Optimizer (optional)

The home page image uses the `bunnyImage` shortcode in [`eleventy.config.js`](eleventy.config.js). By default it renders a plain `<img>`. With `BUNNY_OPTIMIZER=true` it adds a `srcset` of [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) URLs such as `/images/hero.png?width=640&quality=75`, so the pull zone resizes each image at the edge. Turn it on at build time:

```bash
bunny sites deploy --build --env BUNNY_OPTIMIZER=true
```

Optimizer is a paid add-on and is off on new pull zones. On the site's pull zone, enable Optimizer, then turn on the Dynamic Image API and URL Query String vary, and turn off CSS and JS minification. With the flag on but Optimizer off, the images still load, just at full size.
