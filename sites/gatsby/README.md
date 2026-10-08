# Gatsby on Bunny Storage

A Gatsby site built from the minimal starter and served from Bunny Storage through Bunny CDN. `gatsby build` renders every page to static HTML in `public`, including a `404.html` for missing paths.

```bash
bun install
bun run develop
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

The bunny.net CLI detects Gatsby, runs `bun run build`, and uploads `public`. No `bunny.jsonc` is needed.

Read the full guide: [Deploy Gatsby to Bunny Storage](https://docs.bunny.net/storage/static-site-hosting/gatsby).

## Bunny Optimizer (optional)

The home page image uses [`BunnyImage`](src/components/BunnyImage.js). By default it renders a plain `<img>`. With `GATSBY_BUNNY_OPTIMIZER=true` it adds a `srcset` of [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) URLs such as `/images/hero.png?width=640&quality=75`, so the pull zone resizes each image at the edge. Turn it on at build time:

```bash
bunny sites deploy --build --env GATSBY_BUNNY_OPTIMIZER=true
```

Optimizer is a paid add-on and is off on new pull zones. On the site's pull zone, enable Optimizer, then turn on the Dynamic Image API and URL Query String vary, and turn off CSS and JS minification. With the flag on but Optimizer off, the images still load, just at full size.
