# Bunny Player with Vue

A Vite app that embeds a Bunny Stream video and controls it from Vue 3 with [player.js](https://github.com/embedly/player.js).

```bash
bun install
bun dev
```

Open http://localhost:5173 to see the demo video with custom play, pause, mute, speed, and progress controls, plus a log of player events.

## Copy the component

[`src/components/BunnyPlayer.vue`](src/components/BunnyPlayer.vue) loads player.js in `onMounted`, emits the player's events, and exposes the `Player` through a template ref. The same file works unchanged in the [Nuxt example](../player-nuxt).

Bring the `player.js.d.ts` file along too, since player.js ships without types.

## Use your own video

Change `VITE_BUNNY_LIBRARY_ID` and `VITE_BUNNY_VIDEO_ID` in [`.env`](.env) to the IDs from your video's page in the Bunny Stream dashboard, then restart `bun dev`.

## Docs

- [Vue guide](https://docs.bunny.net/stream/player/vue)
- [Playback control API](https://docs.bunny.net/stream/playback-api)
