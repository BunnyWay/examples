# Next.js static export on Bunny Storage with Bunny Optimizer

A Next.js static export served from Bunny Storage through a pull zone. A custom `next/image` loader sends every image to [Bunny Optimizer](https://docs.bunny.net/optimizer), which resizes it at the edge, so the build never processes an image.

```bash
bun install
bun dev
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

[`bunny.jsonc`](bunny.jsonc) tells the bunny.net CLI to run `bun run build` and upload `out`. Each production deploy purges the pull zone, so a changed image shows up straight away.

## Configure the pull zone

`bunny sites create` makes the storage zone and pull zone, and leaves query strings and Optimizer at their defaults. Open the pull zone under **CDN → Pull Zones**:

1. Turn on **URL Query String** under **Caching → General**, so each `?width=` gets its own cache entry.
2. Enable Optimizer, then turn on the Dynamic Image API and automatic WebP under **Optimizer → Settings**. Turn off CSS and JS minification, because Next has already minified both.

## What the config does

[`next.config.ts`](next.config.ts) sets `output: "export"`. Next's default image loader needs a running server, so the export fails until you set a custom loader.

`trailingSlash: true` writes each page as `about/index.html`, which Bunny Storage serves for `/about/`. Next writes `about.html` without it, and `/about` returns a 404.

Next also writes `404.html`, and `bunny sites` serves it as the not-found page.

## Check it works

Image `srcset` URLs stay relative, like `/images/hero.png?width=640&quality=75`, and every one should come back as WebP.

```bash
# Expect image/webp
curl -sI -H 'Accept: image/webp' 'https://my-site.b-cdn.net/images/hero.png?width=640&quality=75' | grep -i content-type
```

## Other setups

- [`optimizer-nextjs-magic-containers`](../optimizer-nextjs-magic-containers): Next.js with a server on Magic Containers
- [`optimizer-nextjs-standalone`](../optimizer-nextjs-standalone): Next.js on any host, behind a pull zone
