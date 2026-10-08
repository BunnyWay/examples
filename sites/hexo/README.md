# Hexo on Bunny Storage

A Hexo blog with the default landscape theme and one post, served from Bunny Storage through Bunny CDN. `hexo generate` renders the site into `public`.

```bash
bun install
bun run server
```

## Deploy

Set `url` in [`_config.yml`](_config.yml) to the URL your site is served from, then:

```bash
bunny sites create my-site
bunny sites deploy --build
```

The bunny.net CLI detects Hexo, runs `hexo generate`, and uploads `public`. No `bunny.jsonc` is needed.

Read the full guide: [Deploy Hexo to Bunny Storage](https://docs.bunny.net/storage/static-site-hosting/hexo).
