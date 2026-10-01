# Bunny Player with Next.js

A Next.js App Router app that embeds a Bunny Stream video and controls it with [player.js](https://github.com/embedly/player.js).

```bash
bun install
bun dev
```

Open http://localhost:3000 to see the demo video with custom play, pause, mute, speed, and progress controls, plus a log of player events.

## Copy the component

[`components/bunny-player.tsx`](components/bunny-player.tsx) is a Client Component. player.js reads `window` on import, so the component renders a placeholder on the server and loads player.js in an effect before mounting the iframe.

Bring the `player.js.d.ts` file along too, since player.js ships without types.

## Use your own video

Change `NEXT_PUBLIC_BUNNY_LIBRARY_ID` and `NEXT_PUBLIC_BUNNY_VIDEO_ID` in [`.env`](.env) to the IDs from your video's page in the Bunny Stream dashboard, then restart `bun dev`.

## Docs

- [Next.js guide](https://docs.bunny.net/stream/player/nextjs)
- [Playback control API](https://docs.bunny.net/stream/playback-api)
