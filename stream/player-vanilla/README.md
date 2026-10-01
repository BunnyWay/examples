# Bunny Player with vanilla JavaScript

A Vite app with no framework that embeds a Bunny Stream video and controls it with [player.js](https://github.com/embedly/player.js).

```bash
bun install
bun dev
```

Open http://localhost:5173 to see the demo video with custom play, pause, mute, speed, and progress controls, plus a log of player events.

## Copy the code

[`src/bunny-player.ts`](src/bunny-player.ts) exports `createBunnyPlayer(container, options)`, which appends the iframe to `container` and returns the player.js `Player`. Listen for events with `player.on()` and call methods such as `player.play()` on it, as [`src/main.ts`](src/main.ts) does.

Bring the `player.js.d.ts` file along too, since player.js ships without types.

Without a bundler, drop the types and import player.js from `https://esm.sh/player.js@0.1.0` inside a `<script type="module">`.

## Use your own video

Change `VITE_BUNNY_LIBRARY_ID` and `VITE_BUNNY_VIDEO_ID` in [`.env`](.env) to the IDs from your video's page in the Bunny Stream dashboard, then restart `bun dev`.

## Docs

- [Bunny Player](https://docs.bunny.net/stream/player)
- [Playback control API](https://docs.bunny.net/stream/playback-api)
