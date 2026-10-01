# Bunny Player with React

A Vite app that embeds a Bunny Stream video and controls it from React with [player.js](https://github.com/embedly/player.js).

```bash
bun install
bun dev
```

Open http://localhost:5173 to see the demo video with custom play, pause, mute, speed, and progress controls, plus a log of player events.

## Copy the component

[`src/components/bunny-player.tsx`](src/components/bunny-player.tsx) renders the iframe and hands you the player.js `Player` through `onReady`, with player events arriving as callback props. For server-rendered apps, see the [Next.js](../player-nextjs), [Nuxt](../player-nuxt), or [SvelteKit](../player-sveltekit) example.

Bring the `player.js.d.ts` file along too, since player.js ships without types.

## Use your own video

Change `VITE_BUNNY_LIBRARY_ID` and `VITE_BUNNY_VIDEO_ID` in [`.env`](.env) to the IDs from your video's page in the Bunny Stream dashboard, then restart `bun dev`.

## Docs

- [React guide](https://docs.bunny.net/stream/player/react)
- [Playback control API](https://docs.bunny.net/stream/playback-api)
