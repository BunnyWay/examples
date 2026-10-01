# Upload to Bunny Stream with Uppy

A React app that uploads videos to Bunny Stream through the [Uppy](https://uppy.io) Dashboard and its TUS plugin, with a small `Bun.serve` backend that signs each upload.

```bash
cp .env.example .env
bun install
bun dev
```

Set `BUNNY_STREAM_LIBRARY_ID` and `BUNNY_STREAM_API_KEY` from your library's **API** page, then open http://localhost:3000 and drop in a few videos.

## How it works

Each file needs its own signature, so [`src/App.tsx`](src/App.tsx) adds an Uppy preprocessor that calls `/api/uploads` for every file before the upload starts. The TUS plugin then sends each file's credentials through its `headers` option. Once a file finishes, the page polls its status and shows Bunny Player when encoding is done.

## Where the code lives

- [`src/index.ts`](src/index.ts): The `Bun.serve` routes for creating, signing, and checking videos.
- [`src/App.tsx`](src/App.tsx): Uppy, the preprocessor, and the TUS plugin options.
- [`src/uploaded-video.tsx`](src/uploaded-video.tsx): Polls the status and renders the player.

The upload routes have no auth check. Put them behind your own sign-in before you deploy.

## Docs

- [TUS resumable uploads](https://docs.bunny.net/stream/tus-resumable-uploads)
- [Uppy Tus plugin](https://uppy.io/docs/tus/)
