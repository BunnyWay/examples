# Ember on Bunny Storage

An Ember app built with Vite and served from Bunny Storage through a pull zone.

```bash
bun install
bun start
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

The bunny.net CLI detects Ember, uploads `dist`, and serves `index.html` for client-side routes such as `/about`.

Read the full guide: [Deploy Ember to Bunny Storage](https://docs.bunny.net/storage/static-site-hosting/ember).

## Bunny Optimizer (optional)

[`app/components/bunny-image.gjs`](app/components/bunny-image.gjs) renders a plain `<img>` by default. Build with `VITE_BUNNY_OPTIMIZER=true` and it adds a `srcset` of `?width=` URLs from 640 to 1920 pixels wide, so [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) resizes the image at the edge.

```bash
bunny sites deploy --build --env VITE_BUNNY_OPTIMIZER=true
```

Optimizer is a paid add-on. Turn it on for the site's pull zone, with the Dynamic Image API and URL Query String vary enabled, and CSS and JavaScript minification off. With the flag on but Optimizer off, the images still load at full size.
