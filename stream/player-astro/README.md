# Bunny Player with Astro

An Astro app that embeds a Bunny Stream video and controls it with [player.js](https://github.com/embedly/player.js), using a custom element instead of a UI framework.

```bash
bun install
bun dev
```

Open http://localhost:4321 to see the demo video with custom play, pause, mute, speed, and progress controls, plus a log of player events.

## Copy the component

[`src/components/BunnyPlayer.astro`](src/components/BunnyPlayer.astro) renders the iframe on the server inside a `<bunny-player>` custom element. Its client script attaches player.js and dispatches `ready`, `play`, `pause`, `ended`, and `timeupdate` as DOM events, with the player.js `Player` as the `ready` event's `detail`.

```js
const element = document.querySelector("bunny-player");

element.addEventListener("ready", (event) => event.detail.play());
```

Each `<bunny-player>` gets its own `Player`, so a page can hold several. Bring the `player.js.d.ts` file along too, since player.js ships without types.

## Use your own video

Change `PUBLIC_BUNNY_LIBRARY_ID` and `PUBLIC_BUNNY_VIDEO_ID` in [`.env`](.env) to the IDs from your video's page in the Bunny Stream dashboard, then restart `bun dev`.

## Docs

- [Bunny Player](https://docs.bunny.net/stream/player)
- [Playback control API](https://docs.bunny.net/stream/playback-api)
