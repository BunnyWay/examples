# Jekyll on Bunny Storage

A Jekyll site built from the default `jekyll new` starter and served from Bunny Storage through Bunny CDN. Jekyll writes the site to `_site`.

```bash
bundle install
bundle exec jekyll serve
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

The bunny.net CLI detects Jekyll from the `Gemfile`, runs `bundle exec jekyll build`, and uploads `_site`. No `bunny.jsonc` is needed.

Read the full guide: [Deploy Jekyll to Bunny Storage](https://docs.bunny.net/storage/static-site-hosting/jekyll).

## Bunny Optimizer (optional)

The home page image uses the [`bunny-image.html`](_includes/bunny-image.html) include. By default it renders a plain `<img>`. With `bunny_optimizer: true` it adds a `srcset` of [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) URLs such as `/images/hero.png?width=640&quality=75`, so the pull zone resizes each image at the edge. Set `bunny_optimizer: true` in [`_config.yml`](_config.yml), then run `bunny sites deploy --build`.

Optimizer is a paid add-on and is off on new pull zones. On the site's pull zone, enable Optimizer, then turn on the Dynamic Image API and URL Query String vary, and turn off CSS and JS minification. With the flag on but Optimizer off, the images still load, just at full size.
