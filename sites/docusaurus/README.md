# Docusaurus on Bunny Storage

A minimal Docusaurus site with a home page and one doc, built to static HTML and served from Bunny Storage through Bunny CDN.

```bash
bun install
bun start
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

The CLI detects Docusaurus, runs `bun run build`, and uploads `build`.

Set `url` in [`docusaurus.config.js`](docusaurus.config.js) to your site's `b-cdn.net` address or custom domain, and keep `baseUrl: '/'`. `trailingSlash` stays unset, so every page builds to a folder with an `index.html`.

Read the guide: [Deploy Docusaurus to Bunny Storage](https://docs.bunny.net/storage/static-site-hosting/docusaurus)

## Bunny Optimizer (optional)

The home page image uses [`BunnyImage`](src/components/BunnyImage/index.js), which reads `customFields.bunnyOptimizer` from [`docusaurus.config.js`](docusaurus.config.js). By default it renders a plain `<img>`. With `BUNNY_OPTIMIZER=true` it adds a `srcset` of [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) URLs such as `/img/hero.png?width=640&quality=75`, so the pull zone resizes each image at the edge. Turn it on at build time:

```bash
bunny sites deploy --build --env BUNNY_OPTIMIZER=true
```

Optimizer is a paid add-on and is off on new pull zones. On the site's pull zone, enable Optimizer, then turn on the Dynamic Image API and URL Query String vary, and turn off CSS and JS minification. With the flag on but Optimizer off, the images still load, just at full size.
