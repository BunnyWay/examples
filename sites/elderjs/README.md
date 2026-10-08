# Elder.js on Bunny Storage

The official Elder.js template, trimmed of its lint and formatting setup, built to static HTML in `public` and served from Bunny Storage through a pull zone.

```bash
bun install
bun run dev
```

Open [localhost:3000](http://localhost:3000). Elder.js hasn't had a release since 2022. The template's SEO check plugin breaks on `cheerio@1.x`, so [`package.json`](package.json) pins `cheerio` to `1.0.0-rc.12`. With that override it installs and builds on Node 22 with Bun or npm. Set `origin` in [`elder.config.js`](elder.config.js) to your site's URL.

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

The CLI detects Elder.js, runs `bun run build`, and uploads `public`. No `bunny.jsonc` is needed.

See the [Elder.js guide](https://docs.bunny.net/storage/static-site-hosting/elderjs) for a manual deploy and custom domains.
