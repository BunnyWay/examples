# Upload to Bunny Stream with TUS in SvelteKit

In this SvelteKit app, the browser uploads videos straight to Bunny Stream over [TUS](https://tus.io) and plays them back once they've encoded.

```bash
cp .env.example .env
bun install
bun dev
```

Set `BUNNY_STREAM_LIBRARY_ID` and `BUNNY_STREAM_API_KEY` from your library's **API** page, then open http://localhost:5173 and choose a video.

## How it works

1. The server creates a video through the Bunny Stream API and signs the upload.
2. tus-js-client sends the file straight to Bunny Stream, with pause and resume.
3. The page polls the video's status and shows Bunny Player once encoding is done.

If you reload mid-upload and pick the same file again, the server re-signs the same video and the upload carries on where it stopped.

## Where the code lives

- [`src/lib/server/bunny-stream.ts`](src/lib/server/bunny-stream.ts): Server-only Bunny Stream API calls and signing.
- [`src/routes/api/uploads/+server.ts`](src/routes/api/uploads/+server.ts): Creates and signs a video, or re-signs an unfinished one.
- [`src/routes/api/videos/[id]/+server.ts`](src/routes/api/videos/[id]/+server.ts): Returns a video's status and embed URL.
- [`src/lib/components/VideoUploader.svelte`](src/lib/components/VideoUploader.svelte): The tus-js-client upload.
- [`src/lib/components/UploadedVideo.svelte`](src/lib/components/UploadedVideo.svelte): Polls the status and renders the player.

The upload routes have no auth check. Put them behind your own sign-in before you deploy.

Before you deploy, swap `@sveltejs/adapter-auto` in [`vite.config.ts`](vite.config.ts) for the [adapter](https://svelte.dev/docs/kit/adapters) that matches your host, and set the variables in its environment. The production server doesn't read `.env`.

## Docs

- [TUS resumable uploads](https://docs.bunny.net/stream/tus-resumable-uploads)
