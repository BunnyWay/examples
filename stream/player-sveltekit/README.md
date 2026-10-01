# Bunny Player with SvelteKit

A SvelteKit app that embeds a Bunny Stream video and controls it from Svelte 5 with [player.js](https://github.com/embedly/player.js), with server rendering switched on.

```bash
bun install
bun dev
```

Open http://localhost:5173 and the demo video loads under a row of custom controls.

## What the demo does

- Play, pause, restart, and mute buttons that call the player through player.js
- 1x, 1.5x, and 2x speed, sent as a raw `setPlaybackRate` command because the npm build of player.js (0.1.0) has no method for it
- A progress bar and clock fed by `timeupdate`
- A log of the last five `ready`, `play`, `pause`, and `ended` events

Once the player is ready, the page asks it for its paused and muted state and listens for `playbackratechange`. If the video autoplays, or someone changes the speed from the player's own menu, the buttons follow.

## Copy the component

[`src/lib/components/BunnyPlayer.svelte`](src/lib/components/BunnyPlayer.svelte) is the file to take into your own app. The server renders a black placeholder, and the browser imports player.js in `onMount` and then renders the iframe, which keeps player.js out of server rendering and loaded before the iframe finishes loading. `{#key src}` replaces the iframe when the video changes, so each video gets a fresh `Player`. Bring [`src/player.js.d.ts`](src/player.js.d.ts) along too, since player.js ships without types.

[`src/lib/components/DemoPlayer.svelte`](src/lib/components/DemoPlayer.svelte) holds the controls and event log. [`src/routes/+page.svelte`](src/routes/+page.svelte) reads the video IDs from `$env/dynamic/public`, so the app still builds with the variables missing and shows setup instructions on the page. `$env/static/public` works too if you'd prefer the build to fail.

## Use your own video

[`.env`](.env) holds the library ID and video GUID for the demo, which is why the app plays straight after cloning. Change `PUBLIC_BUNNY_LIBRARY_ID` and `PUBLIC_BUNNY_VIDEO_ID` to the IDs on your video's page in the Bunny Stream dashboard, then restart `bun dev`.

The file is committed because both IDs appear in every embed URL anyway. Keep secrets out of it. Git ignores every other `.env.*` file, so `.env.local` is the place for values you don't want to share.

## Docs

The [Svelte and SvelteKit guide](https://docs.bunny.net/stream/player/svelte) builds the component step by step, and the [playback control API](https://docs.bunny.net/stream/playback-api) lists every method and event the player supports.
