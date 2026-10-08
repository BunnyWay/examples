# Static HTML on Bunny Storage

A plain HTML, CSS, and JavaScript site with no build step, served from Bunny Storage through Bunny CDN.

```bash
bunx serve public
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy ./public
```

The site lives in `public`, so this README isn't uploaded with it. Read the full guide at [docs.bunny.net](https://docs.bunny.net/storage/static-site-hosting/static-html).
