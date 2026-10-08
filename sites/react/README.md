# Create React App on Bunny Storage

A Create React App project with React Router, served from Bunny Storage through Bunny CDN. Create React App is deprecated, so this example is for existing apps. Start new React apps with [Vite](../vite).

```bash
bun install
bun start
```

## Deploy

```bash
bunny sites create my-site
bunny sites deploy --build
```

The CLI detects Create React App, runs `bun run build`, uploads `build`, and serves `index.html` for client-side routes such as `/about`. Read the full guide at [docs.bunny.net](https://docs.bunny.net/storage/static-site-hosting/react).

## Bunny Optimizer (optional)

[`src/BunnyImage.js`](src/BunnyImage.js) renders a plain `<img>` by default. Build with `REACT_APP_BUNNY_OPTIMIZER=true` and it adds a `srcset` of `?width=` URLs from 640 to 1920 pixels wide, so [Bunny Optimizer](https://docs.bunny.net/optimizer/dynamic-images/overview) resizes the image at the edge.

```bash
bunny sites deploy --build --env REACT_APP_BUNNY_OPTIMIZER=true
```

Optimizer is a paid add-on. Turn it on for the site's pull zone, with the Dynamic Image API and URL Query String vary enabled, and CSS and JavaScript minification off. With the flag on but Optimizer off, the images still load at full size.
