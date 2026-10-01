# Upload to Bunny Stream with Uppy

A React app that uploads videos to Bunny Stream through the [Uppy](https://uppy.io) Dashboard and its TUS plugin, served by a small `Bun.serve` backend that signs each upload.

```bash
cp .env.example .env
bun install
bun dev
```

Set `BUNNY_STREAM_LIBRARY_ID` and `BUNNY_STREAM_API_KEY` in `.env`, then open http://localhost:3000 and drop in a few videos.

Both values are on the library's **API** page in the Bunny Stream dashboard. The API key can create and delete videos, so it stays on the server and `.env` is gitignored.

## How Uppy gets a signature per file

Bunny Stream signs each upload against one video, so every file needs its own credentials before it starts. [`src/App.tsx`](src/App.tsx) adds an Uppy preprocessor that runs when you press upload. For each file it calls `/api/uploads`, which creates a video and returns the signature, and stores the result on the file's meta.

The TUS plugin then reads those values through its `headers` function, so each file sends its own `AuthorizationSignature`, `AuthorizationExpire`, `VideoId`, and `LibraryId`. `allowedMetaFields` limits the TUS metadata to `filetype` and `title`, the two fields Bunny Stream reads, so the signature never travels as metadata.

Once a file finishes, the page polls its status and shows Bunny Player when encoding is done. If signing fails, Uppy's informer shows the error from Bunny Stream.

## Where the code lives

- [`src/index.ts`](src/index.ts): The `Bun.serve` routes. `/api/uploads` creates and signs a video, and `/api/videos/:id` returns its status and embed URL.
- [`src/App.tsx`](src/App.tsx): Uppy, the preprocessor, and the TUS plugin options.
- [`src/uploaded-video.tsx`](src/uploaded-video.tsx): Polls the status and renders the player.

Pause and resume work from the Dashboard while the page is open. Uppy forgets its files on a reload, so resuming after one needs Uppy's Golden Retriever plugin, plus a way to re-sign the same video. The [Next.js TUS example](../upload-tus-nextjs) shows the re-signing half.

The upload routes have no auth check, so anyone who can reach them can create videos in your library. Put them behind your own sign-in before you deploy.

## Docs

[TUS resumable uploads](https://docs.bunny.net/stream/tus-resumable-uploads) covers the signature and metadata fields. Uppy's [Tus plugin docs](https://uppy.io/docs/tus/) list every option.
