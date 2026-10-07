# Next.js on Magic Containers with Bunny Optimizer

A Next.js App Router app for [Magic Containers](https://docs.bunny.net/magic-containers). A CDN endpoint on Magic Containers is a pull zone in front of your app, so [Bunny Optimizer](https://docs.bunny.net/optimizer) can resize each `next/image` request at the edge, and the container never runs `/_next/image`.

```bash
bun install
bun dev
```

## Deploy

Build the image for `linux/amd64`, the only architecture Magic Containers runs, then push it and deploy it with a CDN endpoint. The [Next.js guide](https://docs.bunny.net/magic-containers/guides/nextjs) walks through GitHub Container Registry and the dashboard.

```bash
docker build --platform linux/amd64 -t ghcr.io/<you>/optimizer-nextjs .
docker push ghcr.io/<you>/optimizer-nextjs
```

## Configure the endpoint's pull zone

Open the pull zone behind your CDN endpoint under **CDN → Pull Zones**:

1. Turn on **URL Query String** under **Caching → General**. Endpoint pull zones ignore query strings by default, so a request for `?width=1080` gets the cached `?width=640` image.
2. Enable Optimizer, then turn on the Dynamic Image API and automatic WebP under **Optimizer → Settings**. Turn off CSS and JS minification, because Next has already minified both.

Endpoint pull zones have Smart Cache on, which keeps HTML out of the edge cache, so a deploy needs no purge. Server Actions and cookies reach the container untouched, and [`/cookie`](app/cookie/page.tsx) lets you check.

## Check it works

Image `srcset` URLs stay relative, like `/images/hero.png?width=640&quality=75`, and the network tab shows no requests to `/_next/image`.

```bash
# Expect image/webp
curl -sI -H 'Accept: image/webp' 'https://mc-xxx.bunny.run/images/hero.png?width=640&quality=75' | grep -i content-type
```

## How the loader works

[`lib/bunny-loader.ts`](lib/bunny-loader.ts) turns each `next/image` width into an Optimizer URL. The file starts with `"use client"` because the App Router serialises the loader to the browser. This app leaves `NEXT_PUBLIC_CDN_URL` unset, so the loader returns relative URLs that go through the endpoint.

The loader keeps any params already on `src`, so `src="/images/optimizer.png?aspect_ratio=1:1"` gets Optimizer's square crop on top of Next's responsive widths. Next 16 only accepts quality 75 by default, so list any other values in `images.qualities`.

## Other setups

- [`optimizer-nextjs-standalone`](../optimizer-nextjs-standalone): Next.js on any host, behind a pull zone
- [`optimizer-nextjs-static`](../optimizer-nextjs-static): a static export on Bunny Storage
