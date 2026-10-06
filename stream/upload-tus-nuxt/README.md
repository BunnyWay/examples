# Upload to Bunny Stream with TUS in Nuxt

In this Nuxt app, the browser uploads videos straight to Bunny Stream over [TUS](https://tus.io) and plays them back once they've encoded.

```bash
cp .env.example .env
bun install
bun dev
```

Set `NUXT_BUNNY_STREAM_LIBRARY_ID` and `NUXT_BUNNY_STREAM_API_KEY` from your library's **API** page, then open http://localhost:3000 and choose a video.

## How it works

1. The server creates a video through the Bunny Stream API and signs the upload.
2. tus-js-client sends the file straight to Bunny Stream, with pause and resume.
3. The page polls the video's status and shows Bunny Player once encoding is done.

If you reload mid-upload and pick the same file again, the server re-signs the same video and the upload carries on where it stopped.

## Where the code lives

- [`server/utils/bunny-stream.ts`](server/utils/bunny-stream.ts): Bunny Stream API calls and signing.
- [`server/api/uploads.post.ts`](server/api/uploads.post.ts): Creates and signs a video, or re-signs an unfinished one.
- [`server/api/videos/[id].get.ts`](server/api/videos/[id].get.ts): Returns a video's status and embed URL.
- [`app/components/VideoUploader.vue`](app/components/VideoUploader.vue): The tus-js-client upload.
- [`app/components/UploadedVideo.vue`](app/components/UploadedVideo.vue): Polls the status and renders the player.

The upload routes have no auth check. Put them behind your own sign-in before you deploy.

## Run in production

`nuxt preview` loads `.env`, but `node .output/server/index.mjs` doesn't. Set the variables in your host's environment before you start the production server.

## Docs

- [TUS resumable uploads](https://docs.bunny.net/stream/tus-resumable-uploads)
