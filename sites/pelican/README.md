# Pelican on Bunny Storage

A minimal Pelican blog, as made by `pelican-quickstart`, with one post and one page. It's built with `pelican content` and served from Bunny Storage through a pull zone.

Pelican is installed with [uv](https://docs.astral.sh/uv/):

```bash
uv run pelican --listen --autoreload
```

## Deploy

```bash
bunny sites create my-site
uv run bunny sites deploy --build
```

The bunny.net CLI detects Pelican from `pelicanconf.py`, runs `pelican content`, and uploads `output`. The build needs `pelican` on your `PATH`, so wrap the deploy in `uv run`, which puts the project's virtual environment first.

`SITEURL` is empty in [`pelicanconf.py`](pelicanconf.py), so links start with `/` and work on any domain served from the root.

See the [Pelican guide](https://docs.bunny.net/storage/static-site-hosting/pelican) for a manual deploy and custom domains.
