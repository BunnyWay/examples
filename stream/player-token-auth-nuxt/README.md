# Token-authenticated Bunny Player in Nuxt

A Nuxt 4 app that plays a Bunny Stream video from a library with embed view token authentication turned on. The server signs the embed URL, so the token authentication key never reaches the browser.

```bash
cp .env.example .env
bun install
bun dev
```

In the Bunny Stream dashboard, open your library's **Security** page, turn on **Embed View Token Authentication**, and copy the token authentication key into `NUXT_BUNNY_STREAM_TOKEN_AUTH_KEY`. Set `NUXT_BUNNY_STREAM_LIBRARY_ID` and `NUXT_BUNNY_STREAM_VIDEO_ID` from the video's page, then open http://localhost:3000.

## How it works

1. During SSR, the page calls `/api/embed` with `useFetch`.
2. The route hashes the key, video ID, and expiry time with SHA-256 and adds the hex digest as `token` and the expiry as `expires` on the embed URL.
3. The page renders the player iframe with the signed URL and shows when the link stops working.

Links last an hour (`EMBED_TOKEN_TTL_SECONDS`). Each page load signs a fresh one, and Bunny returns 403 for an expired or badly signed link.

## Where the code lives

- [`server/utils/bunny-stream.ts`](server/utils/bunny-stream.ts): Signs the embed URL.
- [`server/api/embed.get.ts`](server/api/embed.get.ts): Returns the signed URL and its expiry.
- [`app/components/SignedPlayer.vue`](app/components/SignedPlayer.vue): Fetches the signed URL and renders the player.

The route has no auth check, so anyone who can open the page can watch the video. Put it behind your own sign-in before you deploy.

## Run in production

`nuxt preview` loads `.env`, but `node .output/server/index.mjs` doesn't. Set the variables in your host's environment before you start the production server.

## Docs

- [Embedded view token authentication](https://docs.bunny.net/stream/token-authentication)
- [Embedding the player](https://docs.bunny.net/stream/embedding)
