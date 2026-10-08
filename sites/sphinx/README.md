# Sphinx on Bunny Storage

A minimal Sphinx project, as made by `sphinx-quickstart` with `conf.py` at the root, plus a second page. It's built with `sphinx-build` and served from Bunny Storage through a pull zone.

Sphinx is installed with [uv](https://docs.astral.sh/uv/):

```bash
uv run sphinx-build -b html . _build/html
open _build/html/index.html
```

## Deploy

```bash
bunny sites create my-site
uv run bunny sites deploy --build
```

The bunny.net CLI detects Sphinx from `conf.py`, runs `sphinx-build -b html . _build/html`, and uploads `_build/html`. The build needs `sphinx-build` on your `PATH`, so wrap the deploy in `uv run`, which puts the project's virtual environment first.

Because the source directory is the project root, [`conf.py`](conf.py) lists `.venv` in `exclude_patterns`. Without it, Sphinx reads the `.rst` files that ship inside installed packages and publishes them.

See the [Sphinx guide](https://docs.bunny.net/storage/static-site-hosting/sphinx) for a manual deploy and custom domains.
