# Bunny Player with SvelteKit

A SvelteKit app that embeds a Bunny Stream video and controls it from Svelte 5 with [player.js](https://github.com/embedly/player.js).

```bash
bun install
bun dev
```

Open http://localhost:5173 to see the demo video with custom play, pause, mute, speed, and progress controls, plus a log of player events.

## Copy the component

[`src/lib/components/BunnyPlayer.svelte`](src/lib/components/BunnyPlayer.svelte) renders a placeholder on the server and loads player.js in `onMount` before rendering the iframe.

Bring the `player.js.d.ts` file along too, since player.js ships without types.

## Use your own video

Change `PUBLIC_BUNNY_LIBRARY_ID` and `PUBLIC_BUNNY_VIDEO_ID` in [`.env`](.env) to the IDs from your video's page in the Bunny Stream dashboard, then restart `bun dev`.

## Deploy

Before you deploy, swap `@sveltejs/adapter-auto` in [`vite.config.ts`](vite.config.ts) for the [adapter](https://svelte.dev/docs/kit/adapters) that matches your host.

## Docs

- [Svelte and SvelteKit guide](https://docs.bunny.net/stream/player/svelte)
- [Playback control API](https://docs.bunny.net/stream/playback-api)
