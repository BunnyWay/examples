# Astro on Bunny Storage

A static Astro site served from Bunny Storage through Bunny CDN.

```bash
bun install
bun dev
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

The CLI detects Astro, runs `bun run build`, and uploads `dist`.

Read the guide: [Deploy Astro to Bunny Storage](https://docs.bunny.net/storage/static-site-hosting/astro)

## Bunny Optimizer (optional)

By default `<Image>` uses Astro's built-in sharp service, which resizes images at build time. Build with `PUBLIC_BUNNY_OPTIMIZER=true` and [`astro.config.mjs`](astro.config.mjs) switches to [`src/bunny-image-service.ts`](src/bunny-image-service.ts), which copies each image once and writes every `srcset` width as a URL such as `/_astro/optimizer.a1b2c3.png?width=828&quality=75`, so [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) resizes it at the edge. See [`cdn/optimizer-astro-static`](../../cdn/optimizer-astro-static) for the full walkthrough.

```bash
bunny sites deploy --build --env PUBLIC_BUNNY_OPTIMIZER=true
```

Optimizer is a paid add-on. Turn it on for the site's pull zone, with the Dynamic Image API and URL Query String vary enabled, and CSS and JavaScript minification off. With the flag on but Optimizer off, the images still load at full size.
