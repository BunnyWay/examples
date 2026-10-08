# React Router on Bunny Storage

A React Router app in framework mode with server rendering turned off, served from Bunny Storage through a pull zone.

```bash
bun install
bun dev
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

[`react-router.config.ts`](react-router.config.ts) sets `ssr: false`, so the build writes a single-page app to `build/client`. The bunny.net CLI detects React Router, uploads that folder, and serves `index.html` for client-side routes such as `/about`.

Read the full guide: [Deploy React Router to Bunny Storage](https://docs.bunny.net/storage/static-site-hosting/react-router).

## Bunny Optimizer (optional)

[`app/components/BunnyImage.tsx`](app/components/BunnyImage.tsx) renders a plain `<img>` by default. Build with `VITE_BUNNY_OPTIMIZER=true` and it adds a `srcset` of `?width=` URLs from 640 to 1920 pixels wide, so [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) resizes the image at the edge.

```bash
bunny sites deploy --build --env VITE_BUNNY_OPTIMIZER=true
```

Optimizer is a paid add-on. Turn it on for the site's pull zone, with the Dynamic Image API and URL Query String vary enabled, and CSS and JavaScript minification off. With the flag on but Optimizer off, the images still load at full size.
