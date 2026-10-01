# Upload to Bunny Stream with TUS in Next.js

In this Next.js app, the browser uploads videos straight to Bunny Stream over [TUS](https://tus.io), the resumable upload protocol, and plays them back once they've encoded.

```bash
cp .env.example .env.local
bun install
bun dev
```

Set `BUNNY_STREAM_LIBRARY_ID` and `BUNNY_STREAM_API_KEY` in `.env.local`, then open http://localhost:3000 and choose a video.

Both values are on the library's **API** page in the Bunny Stream dashboard. The API key can create and delete videos, so it stays on the server and `.env` is gitignored.

## What happens during an upload

1. The browser asks the server to start an upload. The server creates a video through the Bunny Stream API and signs the upload with `SHA256(library_id + api_key + expiration + video_id)`, valid for 24 hours.
2. tus-js-client sends the file straight to `https://video.bunnycdn.com/tusupload` with the signature in its headers. Pause stops sending chunks, and Resume carries on from the last one Bunny Stream confirmed.
3. When the upload finishes, the page polls the video's status every three seconds and swaps in Bunny Player once encoding is done.

Reloading the page halfway through is covered too. tus-js-client keeps the upload URL in `localStorage`, and the page stores the video ID next to it. Pick the same file again and the server re-signs that video, as long as Bunny Stream is still waiting for its file, so the upload resumes from where it stopped. Otherwise the server creates a fresh video and the upload starts again.

## Where the code lives

- [`lib/bunny-stream.ts`](lib/bunny-stream.ts): Server-only calls to the Bunny Stream API, and the signing. `import "server-only"` stops it ending up in a client bundle.
- [`app/api/uploads/route.ts`](app/api/uploads/route.ts): Creates a video and signs it, or re-signs an unfinished one.
- [`app/api/videos/[id]/route.ts`](app/api/videos/[id]/route.ts): Returns a video's encoding status and embed URL.
- [`components/video-uploader.tsx`](components/video-uploader.tsx): The tus-js-client upload, with pause, resume, and resume after a reload.
- [`components/uploaded-video.tsx`](components/uploaded-video.tsx): Polls the status and renders the player.
- [`lib/video-status.ts`](lib/video-status.ts): Status codes shared by the server and the browser.

The page reads the environment on each request, so a build made without the variables still picks them up at runtime.

The upload routes have no auth check, so anyone who can reach them can create videos in your library. Put them behind your own sign-in before you deploy.

## Docs

[TUS resumable uploads](https://docs.bunny.net/stream/tus-resumable-uploads) covers the signature, the metadata fields, and how long an unfinished upload stays resumable.
