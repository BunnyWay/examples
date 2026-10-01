# Upload to Bunny Stream with TUS in Nuxt

In this Nuxt app, the browser uploads videos straight to Bunny Stream over [TUS](https://tus.io), the resumable upload protocol, and plays them back once they've encoded.

```bash
cp .env.example .env
bun install
bun dev
```

Set `NUXT_BUNNY_STREAM_LIBRARY_ID` and `NUXT_BUNNY_STREAM_API_KEY` in `.env`, then open http://localhost:3000 and choose a video.

Both values are on the library's **API** page in the Bunny Stream dashboard. The API key can create and delete videos, so it stays on the server and `.env` is gitignored.

## What happens during an upload

1. The browser asks the server to start an upload. The server creates a video through the Bunny Stream API and signs the upload with `SHA256(library_id + api_key + expiration + video_id)`, valid for 24 hours.
2. tus-js-client sends the file straight to `https://video.bunnycdn.com/tusupload` with the signature in its headers. Pause stops sending chunks, and Resume carries on from the last one Bunny Stream confirmed.
3. When the upload finishes, the page polls the video's status every three seconds and swaps in Bunny Player once encoding is done.

Reloading the page halfway through is covered too. tus-js-client keeps the upload URL in `localStorage`, and the page stores the video ID next to it. Pick the same file again and the server re-signs that video, as long as Bunny Stream is still waiting for its file, so the upload resumes from where it stopped. Otherwise the server creates a fresh video and the upload starts again.

## Where the code lives

- [`server/utils/bunny-stream.ts`](server/utils/bunny-stream.ts): Calls to the Bunny Stream API, and the signing. It reads private `runtimeConfig`, which never reaches the browser.
- [`server/api/uploads.post.ts`](server/api/uploads.post.ts): Creates a video and signs it, or re-signs an unfinished one.
- [`server/api/videos/[id].get.ts`](server/api/videos/[id].get.ts): Returns a video's encoding status and embed URL.
- [`app/components/VideoUploader.vue`](app/components/VideoUploader.vue): The tus-js-client upload, with pause, resume, and resume after a reload.
- [`app/components/UploadedVideo.vue`](app/components/UploadedVideo.vue): Polls the status and renders the player.
- [`shared/bunny-stream.ts`](shared/bunny-stream.ts): Types and status codes in Nuxt's `shared/` folder, imported by both sides.

Nuxt parses `NUXT_*` values, so a numeric library ID arrives as a number. The server converts it to a string before signing, because the signature hashes it as text.

The upload routes have no auth check, so anyone who can reach them can create videos in your library. Put them behind your own sign-in before you deploy.

## Docs

[TUS resumable uploads](https://docs.bunny.net/stream/tus-resumable-uploads) covers the signature, the metadata fields, and how long an unfinished upload stays resumable.
