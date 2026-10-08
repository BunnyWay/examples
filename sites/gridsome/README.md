# Gridsome on Bunny Storage

A Gridsome site trimmed down from the default starter, built to static files in `dist` and served from Bunny Storage through a pull zone.

```bash
bun install
bun run develop
```

Gridsome hasn't had a release since 2020 and runs on Vue 2, which is end of life. The starter's `sharp@0.25` has no prebuilt binary for current Node, so [`package.json`](package.json) overrides it to `sharp@^0.32.6`. With that override it installs and builds on Node 22 with Bun or npm.

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

The CLI detects Gridsome, runs `bun run build`, and uploads `dist`. No `bunny.jsonc` is needed.

See the [Gridsome guide](https://docs.bunny.net/storage/static-site-hosting/gridsome) for a manual deploy and custom domains.
