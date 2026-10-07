# Bunny CDN examples

These examples serve Next.js and Astro apps through a [bunny.net pull zone](https://docs.bunny.net/cdn), with [Bunny Optimizer](https://docs.bunny.net/optimizer) resizing images at the edge. Pick the one that matches your framework and where your app runs.

| Where the app runs | Next.js | Astro |
| --- | --- | --- |
| Magic Containers, with Optimizer on the CDN endpoint's pull zone | [`optimizer-nextjs-magic-containers`](optimizer-nextjs-magic-containers) | [`optimizer-astro-magic-containers`](optimizer-astro-magic-containers) |
| Any host, with a pull zone for its assets or for the whole site | [`optimizer-nextjs-standalone`](optimizer-nextjs-standalone) | [`optimizer-astro-standalone`](optimizer-astro-standalone) |
| Bunny Storage, as a static build deployed with `bunny sites` | [`optimizer-nextjs-static`](optimizer-nextjs-static) | [`optimizer-astro-static`](optimizer-astro-static) |

Every example needs the same two pull zone settings: query strings in the cache key, and Optimizer with the Dynamic Image API turned on. The Next.js apps share one `next/image` loader, and the Astro apps share one image service.
