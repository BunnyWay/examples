# Bunny Stream examples

Examples for playing and uploading video with [Bunny Stream](https://docs.bunny.net/stream).

## Bunny Player

Each app embeds [Bunny Player](https://docs.bunny.net/stream/player) and controls it with player.js. They all build the same demo page, so you can compare frameworks side by side.

| Example | Stack |
| --- | --- |
| [`player-react`](player-react) | React with Vite |
| [`player-nextjs`](player-nextjs) | Next.js App Router |
| [`player-vue`](player-vue) | Vue 3 with Vite |
| [`player-nuxt`](player-nuxt) | Nuxt 4 |
| [`player-sveltekit`](player-sveltekit) | SvelteKit with Svelte 5 |
| [`player-astro`](player-astro) | Astro |
| [`player-vanilla`](player-vanilla) | Vanilla TypeScript with Vite |

The player apps play a demo video straight after cloning:

```bash
cd stream/player-react
bun install
bun dev
```

## Uploads

The browser uploads video straight to Bunny Stream over [TUS](https://docs.bunny.net/stream/tus-resumable-uploads), with a small server route that creates each video and signs the upload. These need a library ID and API key in `.env`.

| Example | Stack |
| --- | --- |
| [`upload-tus-nextjs`](upload-tus-nextjs) | Next.js with tus-js-client |
| [`upload-tus-nuxt`](upload-tus-nuxt) | Nuxt 4 with tus-js-client |
| [`upload-tus-sveltekit`](upload-tus-sveltekit) | SvelteKit with tus-js-client |
| [`upload-tus-laravel`](upload-tus-laravel) | Laravel with tus-js-client |
| [`upload-tus-rails`](upload-tus-rails) | Rails with tus-js-client |
| [`upload-tus-django`](upload-tus-django) | Django with tus-js-client |
| [`upload-uppy-react`](upload-uppy-react) | Uppy Dashboard with React and Bun |

## Token authentication

With [token authentication](https://docs.bunny.net/stream/token-authentication) turned on, the player only loads embed URLs signed with your library's token authentication key. These apps sign the URL on the server, so the key never reaches the browser. They need a library ID, video ID, and key in `.env`.

| Example | Stack |
| --- | --- |
| [`player-token-auth-nextjs`](player-token-auth-nextjs) | Next.js App Router |
| [`player-token-auth-nuxt`](player-token-auth-nuxt) | Nuxt 4 |
| [`player-token-auth-sveltekit`](player-token-auth-sveltekit) | SvelteKit with Svelte 5 |
