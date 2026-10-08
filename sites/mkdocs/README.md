# MkDocs on Bunny Storage

A minimal MkDocs site, as made by `mkdocs new`, with a second page. It's built with `mkdocs build` and served from Bunny Storage through a pull zone.

MkDocs is installed with [uv](https://docs.astral.sh/uv/):

```bash
uv run mkdocs serve
```

## Deploy

```bash
bunny sites create my-site
uv run bunny sites deploy --build
```

The bunny.net CLI detects MkDocs from `mkdocs.yml`, runs `mkdocs build`, and uploads `site`. The build needs `mkdocs` on your `PATH`, so wrap the deploy in `uv run`, which puts the project's virtual environment first. MkDocs' own 404 page is used for missing paths.

See the [MkDocs guide](https://docs.bunny.net/storage/static-site-hosting/mkdocs) for a manual deploy and custom domains.
