# Bunny Player with Nuxt

A Nuxt 4 app that embeds a Bunny Stream video and controls it with [player.js](https://github.com/embedly/player.js). It uses the same component as the [Vue example](../player-vue).

```bash
bun install
bun dev
```

Open http://localhost:3000 to see the demo video with custom play, pause, mute, speed, and progress controls, plus a log of player events.

## Copy the component

[`app/components/BunnyPlayer.vue`](app/components/BunnyPlayer.vue) renders a placeholder on the server and loads player.js in `onMounted`, so it needs no `<ClientOnly>` wrapper.

Bring the `player.js.d.ts` file along too, since player.js ships without types.

## Use your own video

Change `NUXT_PUBLIC_BUNNY_LIBRARY_ID` and `NUXT_PUBLIC_BUNNY_VIDEO_ID` in [`.env`](.env) to the IDs from your video's page in the Bunny Stream dashboard, then restart `bun dev`.

## Docs

- [Vue and Nuxt guide](https://docs.bunny.net/stream/player/vue)
- [Playback control API](https://docs.bunny.net/stream/playback-api)
