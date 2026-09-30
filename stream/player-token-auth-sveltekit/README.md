# Token-authenticated Bunny Player in SvelteKit

A SvelteKit app that plays a Bunny Stream video from a library with embed view token authentication turned on. The server signs the embed URL, so the token key never reaches the browser.

```bash
cp .env.example .env
bun install
bun dev
```

In the Bunny Stream dashboard, open your library's **Security** page and enable embed view token authentication. Copy the token authentication key from the same page into `BUNNY_STREAM_TOKEN_AUTH_KEY`, set `BUNNY_STREAM_LIBRARY_ID` from the library's **API** page and `BUNNY_STREAM_VIDEO_ID` from the video's page, then open http://localhost:5173.

## How it works

1. The page's `load` function runs on the server and hashes the token key, video ID, and an expiry one hour away with SHA-256.
2. It adds the hex digest and expiry to the embed URL as `token` and `expires`, and hands only that URL to the page.
3. The page renders Bunny Player with the signed URL. Bunny rejects the link once it expires, and every page load signs a fresh one.

Anyone who copies the signed URL can play the video until it expires. Shorten `TOKEN_TTL_SECONDS` to narrow that window, and put the page behind your own sign-in before you deploy.

## Where the code lives

- [`src/lib/server/bunny-stream.ts`](src/lib/server/bunny-stream.ts): Server-only signing of the embed URL.
- [`src/routes/+page.server.ts`](src/routes/+page.server.ts): Signs the URL for each request.
- [`src/routes/+page.svelte`](src/routes/+page.svelte): Renders the player and when its link expires.

## Docs

- [Embedded view token authentication](https://docs.bunny.net/stream/token-authentication)
- [Security options](https://docs.bunny.net/stream/security-options)
