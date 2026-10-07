# Astro static build on Bunny Storage with Bunny Optimizer

A static Astro site served from Bunny Storage through a pull zone. A custom image service sends every `<Image>` width to [Bunny Optimizer](https://docs.bunny.net/optimizer), which resizes it at the edge, so the build never processes an image.

```bash
bun install
bun dev
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

[`bunny.jsonc`](bunny.jsonc) tells the bunny.net CLI to run `bun run build` and upload `dist`. Each production deploy purges the pull zone, so a changed image shows up straight away.

## Configure the pull zone

`bunny sites create` makes the storage zone and pull zone, and leaves query strings and Optimizer at their defaults. Open the pull zone under **CDN → Pull Zones**:

1. Turn on **URL Query String** under **Caching → General**, so each `?width=` gets its own cache entry.
2. Enable Optimizer, then turn on the Dynamic Image API and automatic WebP under **Optimizer → Settings**. Turn off CSS and JS minification, because Astro has already minified both.

## How the image service works

[`src/bunny-image-service.ts`](src/bunny-image-service.ts) spreads Astro's `baseService`, so Astro still works out the `srcset` widths, and only `getURL` changes. The build copies each image once, and every width in the `srcset` is an Optimizer URL such as `/_astro/optimizer.-7Tugyih.png?width=640&quality=50`.

## Check it works

```bash
# Expect image/webp
curl -sI -H 'Accept: image/webp' 'https://my-site.b-cdn.net/images/hero.png?width=640&quality=75' | grep -i content-type
```

## Other setups

- [`optimizer-astro-magic-containers`](../optimizer-astro-magic-containers): Astro with a server on Magic Containers
- [`optimizer-astro-standalone`](../optimizer-astro-standalone): Astro on any host, behind a pull zone
