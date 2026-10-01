# Upload to Bunny Stream with TUS in SvelteKit

In this SvelteKit app, the browser uploads videos straight to Bunny Stream over [TUS](https://tus.io), the resumable upload protocol, and plays them back once they've encoded.

```bash
cp .env.example .env
bun install
bun dev
```

Set `BUNNY_STREAM_LIBRARY_ID` and `BUNNY_STREAM_API_KEY` in `.env`, then open http://localhost:5173 and choose a video.

Both values are on the library's **API** page in the Bunny Stream dashboard. The API key can create and delete videos, so it stays on the server and `.env` is gitignored.

## What happens during an upload

1. The browser asks the server to start an upload. The server creates a video through the Bunny Stream API and signs the upload with `SHA256(library_id + api_key + expiration + video_id)`, valid for 24 hours.
2. tus-js-client sends the file straight to `https://video.bunnycdn.com/tusupload` with the signature in its headers. Pause stops sending chunks, and Resume carries on from the last one Bunny Stream confirmed.
3. When the upload finishes, the page polls the video's status every three seconds and swaps in Bunny Player once encoding is done.

Reloading the page halfway through is covered too. tus-js-client keeps the upload URL in `localStorage`, and the page stores the video ID next to it. Pick the same file again and the server re-signs that video, as long as Bunny Stream is still waiting for its file, so the upload resumes from where it stopped. Otherwise the server creates a fresh video and the upload starts again.

## Where the code lives

- [`src/lib/server/bunny-stream.ts`](src/lib/server/bunny-stream.ts): Calls to the Bunny Stream API, and the signing. It reads `$env/dynamic/private`, and SvelteKit refuses to bundle anything in `$lib/server` for the browser.
- [`src/routes/api/uploads/+server.ts`](src/routes/api/uploads/+server.ts): Creates a video and signs it, or re-signs an unfinished one.
- [`src/routes/api/videos/[id]/+server.ts`](src/routes/api/videos/[id]/+server.ts): Returns a video's encoding status and embed URL.
- [`src/lib/components/VideoUploader.svelte`](src/lib/components/VideoUploader.svelte): The tus-js-client upload, with pause, resume, and resume after a reload.
- [`src/lib/components/UploadedVideo.svelte`](src/lib/components/UploadedVideo.svelte): Polls the status and renders the player.
- [`src/lib/bunny-stream.ts`](src/lib/bunny-stream.ts): Types and status codes shared by the server and the components.

`+page.server.ts` tells the page whether the variables are set, so a missing key shows setup instructions on the page.

The upload routes have no auth check, so anyone who can reach them can create videos in your library. Put them behind your own sign-in before you deploy.

## Docs

[TUS resumable uploads](https://docs.bunny.net/stream/tus-resumable-uploads) covers the signature, the metadata fields, and how long an unfinished upload stays resumable.
