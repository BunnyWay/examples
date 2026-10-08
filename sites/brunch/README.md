# Brunch on Bunny Storage

A Brunch app built from the `dead-simple` skeleton and served from Bunny Storage through Bunny CDN. A production build compiles and bundles everything into `public`.

Brunch is no longer maintained, and the `brunch` package on npm now belongs to a new owner, so this example pins the last release, `brunch@4.0.2`, as a dev dependency.

```bash
bun install
bun start
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

The bunny.net CLI detects Brunch, runs `brunch build --production`, and uploads `public`. No `bunny.jsonc` is needed.

Read the full guide: [Deploy Brunch to Bunny Storage](https://docs.bunny.net/storage/static-site-hosting/brunch).
