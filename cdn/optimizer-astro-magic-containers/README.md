# Astro on Magic Containers with Bunny Optimizer

An Astro app with the Node adapter, for [Magic Containers](https://docs.bunny.net/magic-containers). A CDN endpoint on Magic Containers is a pull zone in front of your app, so a custom image service can send every `<Image>` width to [Bunny Optimizer](https://docs.bunny.net/optimizer), which resizes it at the edge.

```bash
bun install
bun dev
```

## Deploy

Build the image for `linux/amd64`, the only architecture Magic Containers runs, then push it and deploy it with a CDN endpoint. The [Astro guide](https://docs.bunny.net/magic-containers/guides/astro) walks through GitHub Container Registry and the dashboard.

```bash
docker build --platform linux/amd64 -t ghcr.io/<you>/optimizer-astro .
docker push ghcr.io/<you>/optimizer-astro
```

## Configure the endpoint's pull zone

Open the pull zone behind your CDN endpoint under **CDN → Pull Zones**:

1. Turn on **URL Query String** under **Caching → General**. Endpoint pull zones ignore query strings by default, so a request for `?width=1080` gets the cached `?width=640` image.
2. Enable Optimizer, then turn on the Dynamic Image API and automatic WebP under **Optimizer → Settings**. Turn off CSS and JS minification, because Astro has already minified both.

Endpoint pull zones have Smart Cache on, which keeps HTML out of the edge cache, so a deploy needs no purge. Form posts and cookies reach the container untouched, and [`/cookie`](src/pages/cookie.astro) lets you check.

## Check it works

Image `srcset` URLs stay relative, like `/images/hero.png?width=640&quality=75`.

```bash
# Expect image/webp
curl -sI -H 'Accept: image/webp' 'https://mc-xxx.bunny.run/images/hero.png?width=640&quality=75' | grep -i content-type
```

## How the image service works

[`src/bunny-image-service.ts`](src/bunny-image-service.ts) spreads Astro's `baseService`, so Astro still works out the `srcset` widths, and only `getURL` changes. It adds `?width=` and `?quality=` to each image on your own zone, and leaves images on other hosts alone, since Optimizer can't reach them.

Images in `src/assets` get a hashed `/_astro` URL that the Node adapter serves with a one-year `immutable` header. Images in `public` are served with `max-age=0`, so the pull zone revalidates them with the container on every cache miss.

## Other setups

- [`optimizer-astro-standalone`](../optimizer-astro-standalone): Astro on any host, behind a pull zone
- [`optimizer-astro-static`](../optimizer-astro-static): a static build on Bunny Storage
