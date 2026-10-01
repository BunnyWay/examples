# Bunny Player with Vue

A Vite app that embeds a Bunny Stream video and controls it from Vue 3 with [player.js](https://github.com/embedly/player.js).

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

[`src/components/BunnyPlayer.vue`](src/components/BunnyPlayer.vue) is the file to take into your own app. It imports player.js in `onMounted`, renders the iframe once the library has loaded, emits the player's events, and exposes the `Player` through a template ref. Bring [`src/player.js.d.ts`](src/player.js.d.ts) along too, since player.js ships without types.

Loading player.js in `onMounted` keeps the component safe for server rendering, so the same file runs unchanged in the [Nuxt example](../player-nuxt).

[`src/components/DemoPlayer.vue`](src/components/DemoPlayer.vue) holds the controls and event log, and [`src/App.vue`](src/App.vue) reads the video IDs from the environment.

## Use your own video

[`.env`](.env) holds the library ID and video GUID for the demo, which is why the app plays straight after cloning. Change `VITE_BUNNY_LIBRARY_ID` and `VITE_BUNNY_VIDEO_ID` to the IDs on your video's page in the Bunny Stream dashboard, then restart `bun dev`.

The file is committed because both IDs appear in every embed URL anyway. Keep secrets out of it. Git ignores every other `.env.*` file, so `.env.local` is the place for values you don't want to share.

## Docs

The [Vue guide](https://docs.bunny.net/stream/player/vue) builds the component step by step, and the [playback control API](https://docs.bunny.net/stream/playback-api) lists every method and event the player supports.
