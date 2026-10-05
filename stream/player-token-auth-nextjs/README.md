# Token-authenticated Bunny Player in Next.js

A Next.js App Router app that plays a Bunny Stream video from a library with embed view token authentication turned on. The server signs the embed URL, so the key never reaches the browser.

```bash
cp .env.example .env.local
bun install
bun dev
```

In the Bunny Stream dashboard, open your library's **Security** page, enable **Embed view token authentication**, and copy the token authentication key into `BUNNY_STREAM_TOKEN_AUTH_KEY`. Set `BUNNY_STREAM_LIBRARY_ID` and `BUNNY_STREAM_VIDEO_ID` from the video's page, then open http://localhost:3000.

## How it works

1. On each request, the page hashes the key, video ID, and expiry time with SHA-256.
2. It appends the hex digest and expiry as `token` and `expires` to the embed URL.
3. Bunny checks the pair when the iframe loads and answers with a 403 if the token is wrong or the time has passed.

Links last an hour. Change `TOKEN_TTL_SECONDS` in [`lib/bunny-stream.ts`](lib/bunny-stream.ts) to make them shorter or longer.

## Where the code lives

- [`lib/bunny-stream.ts`](lib/bunny-stream.ts): Server-only token signing.
- [`app/page.tsx`](app/page.tsx): Signs the URL and renders the player.

The page signs a link for anyone who visits. Put it behind your own sign-in before you deploy, or anyone can copy a fresh link.

## Docs

- [Embedded view token authentication](https://docs.bunny.net/stream/token-authentication)
- [Embedding videos](https://docs.bunny.net/stream/embedding)
