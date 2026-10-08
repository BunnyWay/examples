# Nuxt on Bunny Storage

A Nuxt app prerendered with `nuxt generate` and served from Bunny Storage through Bunny CDN. The home page renders a responsive image with [Nuxt Image](https://image.nuxt.com).

```bash
bun install
bun dev
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

The bunny.net CLI detects Nuxt, runs `nuxi generate`, and uploads `.output/public`. The generated `404.html` becomes the site's not-found page.

## Bunny Optimizer (optional)

By default Nuxt Image resizes each `srcset` width at build time. Set `NUXT_PUBLIC_BUNNY_OPTIMIZER=true` and [`nuxt.config.ts`](nuxt.config.ts) switches to the [`bunny` provider](https://image.nuxt.com/providers/bunny) instead, so the `srcset` points at the original image with a `?width=` query and [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) resizes it at the edge.

```bash
bunny sites deploy --build --env NUXT_PUBLIC_BUNNY_OPTIMIZER=true
```

Optimizer is a paid add-on that `bunny sites create` leaves off. Open the pull zone under **CDN → Pull Zones**, enable Optimizer, and turn on the Dynamic Image API and automatic WebP under **Optimizer → Settings**. Turn on **URL Query String** under **Caching → General** so each width gets its own cache entry, and turn off CSS and JS minification, because Nuxt has already minified both. With the flag on but Optimizer off, the images still load at full size.

```bash
# Expect image/webp once Optimizer is on
curl -sI -H 'Accept: image/webp' 'https://my-site.b-cdn.net/images/hero.png?width=640&height=329&quality=75' | grep -i content-type
```

See [Deploy Nuxt to Bunny Storage](https://docs.bunny.net/storage/static-site-hosting/nuxt) for the full guide.
