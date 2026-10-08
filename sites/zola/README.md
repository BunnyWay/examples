# Zola on Bunny Storage

A minimal Zola site built with `zola build` and served from Bunny Storage through a pull zone. It has no theme, just three templates and a stylesheet.

```bash
zola serve
```

## Deploy

Set `base_url` in [`config.toml`](config.toml) to the URL your site is served from, then:

```bash
bunny sites create my-site
bunny sites deploy --build
```

The bunny.net CLI detects Zola from `config.toml` next to `templates`, runs `zola build`, and uploads `public`. You need `zola` installed. Zola's own 404 page is used for missing paths.

`zola init` names the config file `zola.toml`, which the CLI doesn't detect. Rename it to `config.toml`, which Zola still reads, or set `sites.build` and `sites.dir` in `bunny.jsonc`.

See the [Zola guide](https://docs.bunny.net/storage/static-site-hosting/zola) for a manual deploy and custom domains.

## Bunny Optimizer (optional)

The home page image uses the `bunny_image` component in [`templates/components/bunny_image.html`](templates/components/bunny_image.html). By default it renders a plain `<img>`. With `bunny_optimizer = true` it adds a `srcset` of [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) URLs such as `/images/hero.png?width=640&quality=75`, so the pull zone resizes each image at the edge. Set `bunny_optimizer = true` under `[extra]` in [`config.toml`](config.toml), then run `bunny sites deploy --build`.

Optimizer is a paid add-on and is off on new pull zones. On the site's pull zone, enable Optimizer, then turn on the Dynamic Image API and URL Query String vary, and turn off CSS and JS minification. With the flag on but Optimizer off, the images still load, just at full size.
