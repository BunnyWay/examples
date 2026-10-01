# Bunny Player with Next.js

A Next.js App Router app that embeds a Bunny Stream video and controls it with [player.js](https://github.com/embedly/player.js). A Server Component reads the video IDs and passes them to the Client Components that talk to the player.

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

[`components/bunny-player.tsx`](components/bunny-player.tsx) is the Client Component to take into your own app. Server rendering adds two constraints. player.js reads `window` the moment it's imported, and it has to load before the iframe finishes loading, or `ready` never fires. The component handles both: the server renders a black placeholder, an effect imports player.js in the browser, and then the iframe and the `Player` mount together.

Bring [`player.js.d.ts`](player.js.d.ts) along too, since player.js ships without types.

[`components/demo-player.tsx`](components/demo-player.tsx) holds the controls and event log. It's a Client Component as well, because it passes functions as props to `BunnyPlayer`. [`app/page.tsx`](app/page.tsx) is the Server Component that renders it.

## Use your own video

[`.env`](.env) holds the library ID and video GUID for the demo, which is why the app plays straight after cloning. Change `NEXT_PUBLIC_BUNNY_LIBRARY_ID` and `NEXT_PUBLIC_BUNNY_VIDEO_ID` to the IDs on your video's page in the Bunny Stream dashboard, then restart `bun dev`.

The file is committed because both IDs appear in every embed URL anyway. Keep secrets out of it. Git ignores every other `.env.*` file, so `.env.local` is the place for values you don't want to share.

## Docs

The [Next.js guide](https://docs.bunny.net/stream/player/nextjs) builds the component step by step, and the [playback control API](https://docs.bunny.net/stream/playback-api) lists every method and event the player supports.
