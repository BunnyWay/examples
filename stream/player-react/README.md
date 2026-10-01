# Bunny Player with React

A Vite app that embeds a Bunny Stream video and controls it from React with [player.js](https://github.com/embedly/player.js).

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

[`src/components/bunny-player.tsx`](src/components/bunny-player.tsx) is the file to take into your own app. It renders the iframe, creates a player.js `Player` once the iframe is in the DOM, and hands you that `Player` through `onReady`, with `play`, `pause`, `ended`, and `timeupdate` arriving as callback props. Bring [`src/player.js.d.ts`](src/player.js.d.ts) along too, since player.js ships without types.

The component imports player.js at the top of the file. That's early enough in a client-rendered app, because the module has loaded by the time the iframe does. player.js reads `window` on import, so a server-rendered app needs the pattern in the [Next.js](../player-nextjs), [Nuxt](../player-nuxt), or [SvelteKit](../player-sveltekit) example.

[`src/App.tsx`](src/App.tsx) is the demo page wrapped around it.

## Use your own video

[`.env`](.env) holds the library ID and video GUID for the demo, which is why the app plays straight after cloning. Change `VITE_BUNNY_LIBRARY_ID` and `VITE_BUNNY_VIDEO_ID` to the IDs on your video's page in the Bunny Stream dashboard, then restart `bun dev`.

The file is committed because both IDs appear in every embed URL anyway. Keep secrets out of it. Git ignores every other `.env.*` file, so `.env.local` is the place for values you don't want to share.

## Docs

The [React guide](https://docs.bunny.net/stream/player/react) builds the component step by step, and the [playback control API](https://docs.bunny.net/stream/playback-api) lists every method and event the player supports.
