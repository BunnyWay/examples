# Static sites on Bunny Storage

Starter sites for 30 frameworks, each served from Bunny Storage through a pull zone. Every example matches its [static site hosting guide](https://docs.bunny.net/storage/static-site-hosting) and deploys with two commands:

```bash
cd sites/astro
bunny sites create my-site
bunny sites deploy --build
```

`bunny sites create` makes the storage zone and pull zone and writes `.bunny/site.json` to link the folder to the site. `bunny sites deploy --build` detects the framework, runs its build with the package manager from your lockfile, and publishes the output. An example only has a `bunny.jsonc` when the framework needs one.

## JavaScript

| Example | Output | Notes |
| --- | --- | --- |
| [`analog`](analog) | `dist/analog/public` | Prerendered routes |
| [`angular`](angular) | `dist/my-app/browser` | `bunny.jsonc` sets the output dir, Optimizer image loader |
| [`astro`](astro) | `dist` | Optimizer image service |
| [`brunch`](brunch) | `public` | Pinned to `brunch@4.0.2` |
| [`ember`](ember) | `dist` | Single-page app |
| [`nextjs`](nextjs) | `out` | Static export, Optimizer image loader |
| [`nuxt`](nuxt) | `.output/public` | Static generate, Optimizer through Nuxt Image |
| [`preact`](preact) | `build` | Single-page app |
| [`qwik`](qwik) | `dist` | Static adapter |
| [`react`](react) | `build` | Single-page app |
| [`react-router`](react-router) | `build/client` | `ssr: false`, single-page app |
| [`solidstart`](solidstart) | `.output/public` | Static preset |
| [`sveltekit`](sveltekit) | `build` | `adapter-static` |
| [`vite`](vite) | `dist` | Single-page app |
| [`vue`](vue) | `dist` | Vue Router, single-page app |

## Static site generators

| Example | Output | Notes |
| --- | --- | --- |
| [`docusaurus`](docusaurus) | `build` | |
| [`elderjs`](elderjs) | `public` | Pins `cheerio` for the SEO plugin |
| [`eleventy`](eleventy) | `_site` | |
| [`gatsby`](gatsby) | `public` | |
| [`gridsome`](gridsome) | `dist` | Pins `sharp` to build on Node 22 |
| [`hexo`](hexo) | `public` | |
| [`hugo`](hugo) | `public` | Needs `hugo` |
| [`jekyll`](jekyll) | `_site` | Ruby with Bundler |
| [`mkdocs`](mkdocs) | `site` | Python with uv |
| [`pelican`](pelican) | `output` | Python with uv |
| [`sphinx`](sphinx) | `_build/html` | Python with uv |
| [`static-html`](static-html) | `public` | No build step |
| [`vitepress`](vitepress) | `docs/.vitepress/dist` | `bunny.jsonc` sets the build and output dir |
| [`zola`](zola) | `public` | Needs `zola` |

## .NET

| Example | Output | Notes |
| --- | --- | --- |
| [`blazor`](blazor) | `bin/publish/wwwroot` | `bunny.jsonc` sets the build, output dir, and single-page app |

The Python examples keep their tools in a uv project, so run the deploy through uv to put them on your `PATH`:

```bash
uv run bunny sites deploy --build
```

## Bunny Optimizer (optional)

Most examples include a small image helper that can hand resizing to [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview). It's off by default, so images load as they are. Turn it on at build time and each image gets a `srcset` of URLs like `/images/photo.jpg?width=640&quality=75`, which Optimizer resizes at the edge:

```bash
bunny sites deploy --build --env VITE_BUNNY_OPTIMIZER=true
```

The flag uses each framework's public prefix, such as `VITE_`, `PUBLIC_`, `NEXT_PUBLIC_`, `GATSBY_`, or `HUGO_`. Jekyll and Zola read `bunny_optimizer` from their config file instead. Each example's README has the exact name.

Optimizer is a paid add-on on the site's pull zone. Under **CDN → Pull Zones**, enable Optimizer with the Dynamic Image API, turn on URL Query String vary, and turn off CSS and JS minification. If the flag is on and Optimizer is off, images still load at full size.

The examples without a helper are Brunch, Elder.js, Gridsome, Hexo, MkDocs, Pelican, Sphinx, static HTML, and Blazor.
