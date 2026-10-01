# Bunny Player with Nuxt

A Nuxt 4 app that embeds a Bunny Stream video and controls it with [player.js](https://github.com/embedly/player.js). It uses the same components as the [Vue example](../player-vue), running under server rendering.

```bash
bun install
bun dev
```

Open http://localhost:3000 and the demo video loads under a row of custom controls.

## What the demo does

- Play, pause, restart, and mute buttons that call the player through player.js
- 1x, 1.5x, and 2x speed, sent as a raw `setPlaybackRate` command because the npm build of player.js (0.1.0) has no method for it
- A progress bar and clock fed by `timeupdate`
- A log of the last five `ready`, `play`, `pause`, and `ended` events

Once the player is ready, the page asks it for its paused and muted state and listens for `playbackratechange`. If the video autoplays, or someone changes the speed from the player's own menu, the buttons follow.

## Copy the component

[`app/components/BunnyPlayer.vue`](app/components/BunnyPlayer.vue) is the file to take into your own app. The server renders a black placeholder, and the browser imports player.js in `onMounted` and swaps in the iframe. player.js has to load before the iframe finishes loading, and this order guarantees it, so the component needs no `<ClientOnly>` wrapper. Bring [`app/player.js.d.ts`](app/player.js.d.ts) along too, since player.js ships without types.

[`app/components/DemoPlayer.vue`](app/components/DemoPlayer.vue) holds the controls and event log. [`app/app.vue`](app/app.vue) reads the video IDs from `runtimeConfig.public` in [`nuxt.config.ts`](nuxt.config.ts), so you can set them with `NUXT_PUBLIC_*` variables at runtime without a rebuild.

## Use your own video

[`.env`](.env) holds the library ID and video GUID for the demo, which is why the app plays straight after cloning. Change `NUXT_PUBLIC_BUNNY_LIBRARY_ID` and `NUXT_PUBLIC_BUNNY_VIDEO_ID` to the IDs on your video's page in the Bunny Stream dashboard, then restart `bun dev`.

The file is committed because both IDs appear in every embed URL anyway. Keep secrets out of it. In production, set the `NUXT_PUBLIC_*` variables in your hosting environment.

## Docs

The [Vue and Nuxt guide](https://docs.bunny.net/stream/player/vue) builds the component step by step, and the [playback control API](https://docs.bunny.net/stream/playback-api) lists every method and event the player supports.
