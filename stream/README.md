# Bunny Stream examples

[Bunny Stream](https://docs.bunny.net/stream) hosts, encodes, and delivers your video. These examples cover the parts you build on your side: playing video and uploading it.

## Bunny Player

Each app embeds [Bunny Player](https://docs.bunny.net/stream/player) in an iframe and controls it with player.js. They share one demo page, so you can open two side by side and compare how each framework handles the same component.

| Example | Stack |
| --- | --- |
| [`player-react`](player-react) | React with Vite |
| [`player-nextjs`](player-nextjs) | Next.js App Router |
| [`player-vue`](player-vue) | Vue 3 with Vite |
| [`player-nuxt`](player-nuxt) | Nuxt 4 |
| [`player-sveltekit`](player-sveltekit) | SvelteKit with Svelte 5 |

Every player app plays a demo video straight after cloning:

```bash
cd stream/player-react
bun install
bun dev
```

## Uploads

In these apps, the browser sends video straight to Bunny Stream over [TUS](https://docs.bunny.net/stream/tus-resumable-uploads), with a small server route that creates each video and signs the upload. They need a library ID and API key in `.env`.

| Example | Stack |
| --- | --- |
| [`upload-tus-nextjs`](upload-tus-nextjs) | Next.js with tus-js-client |
| [`upload-tus-nuxt`](upload-tus-nuxt) | Nuxt 4 with tus-js-client |
| [`upload-tus-sveltekit`](upload-tus-sveltekit) | SvelteKit with tus-js-client |
| [`upload-uppy-react`](upload-uppy-react) | Uppy Dashboard with React and Bun |

The three tus-js-client apps can pause, resume, and pick an upload back up after a page reload.
