# Upload to Bunny Stream with TUS in Next.js

In this Next.js app, the browser uploads videos straight to Bunny Stream over [TUS](https://tus.io) and plays them back once they've encoded.

```bash
cp .env.example .env.local
bun install
bun dev
```

Set `BUNNY_STREAM_LIBRARY_ID` and `BUNNY_STREAM_API_KEY` from your library's **API** page, then open http://localhost:3000 and choose a video.

## How it works

1. The server creates a video through the Bunny Stream API and signs the upload.
2. tus-js-client sends the file straight to Bunny Stream, with pause and resume.
3. The page polls the video's status and shows Bunny Player once encoding is done.

If you reload mid-upload and pick the same file again, the server re-signs the same video and the upload carries on where it stopped.

## Where the code lives

- [`lib/bunny-stream.ts`](lib/bunny-stream.ts): Server-only Bunny Stream API calls and signing.
- [`app/api/uploads/route.ts`](app/api/uploads/route.ts): Creates and signs a video, or re-signs an unfinished one.
- [`app/api/videos/[id]/route.ts`](app/api/videos/[id]/route.ts): Returns a video's status and embed URL.
- [`components/video-uploader.tsx`](components/video-uploader.tsx): The tus-js-client upload.
- [`components/uploaded-video.tsx`](components/uploaded-video.tsx): Polls the status and renders the player.

The upload routes have no auth check. Put them behind your own sign-in before you deploy.

## Docs

- [TUS resumable uploads](https://docs.bunny.net/stream/tus-resumable-uploads)
