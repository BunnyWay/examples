# Hugo on Bunny Storage

A minimal Hugo site built with `hugo --minify` and served from Bunny Storage through a pull zone. It has no theme, just two layouts and a fingerprinted stylesheet.

```bash
hugo server
```

## Deploy

Set `baseURL` in [`hugo.toml`](hugo.toml) to the URL your site is served from, then:

```bash
bunny sites create my-site
bunny sites deploy --build
```

The bunny.net CLI detects Hugo from `hugo.toml`, runs `hugo --minify`, and uploads `public`. You need `hugo` installed.

See the [Hugo guide](https://docs.bunny.net/storage/static-site-hosting/hugo) for a manual deploy and custom domains.

## Bunny Optimizer (optional)

The home page image uses the [`bunny-image.html`](layouts/_partials/bunny-image.html) partial. By default it renders a plain `<img>`. With `HUGO_BUNNY_OPTIMIZER=true` it adds a `srcset` of [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) URLs such as `/images/hero.png?width=640&quality=75`, so the pull zone resizes each image at the edge. Turn it on at build time:

```bash
bunny sites deploy --build --env HUGO_BUNNY_OPTIMIZER=true
```

Optimizer is a paid add-on and is off on new pull zones. On the site's pull zone, enable Optimizer, then turn on the Dynamic Image API and URL Query String vary, and turn off CSS and JS minification. With the flag on but Optimizer off, the images still load, just at full size.
