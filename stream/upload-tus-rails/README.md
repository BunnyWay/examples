# Upload to Bunny Stream with TUS in Rails

In this Rails app, the browser uploads videos straight to Bunny Stream over [TUS](https://tus.io) and plays them back once they've encoded.

```bash
cp .env.example .env
bundle install
bin/dev
```

Set `BUNNY_STREAM_LIBRARY_ID` and `BUNNY_STREAM_API_KEY` from your library's **API** page, then open http://localhost:3000 and choose a video.

## How it works

1. The server creates a video through the Bunny Stream API and signs the upload.
2. tus-js-client sends the file straight to Bunny Stream, with pause and resume.
3. The page polls the video's status and shows Bunny Player once encoding is done.

If you reload mid-upload and pick the same file again, the server re-signs the same video and the upload carries on where it stopped.

## Where the code lives

- [`app/models/bunny_stream.rb`](app/models/bunny_stream.rb): Server-only Bunny Stream API calls and signing.
- [`app/controllers/api/uploads_controller.rb`](app/controllers/api/uploads_controller.rb): Creates and signs a video, or re-signs an unfinished one.
- [`app/controllers/api/videos_controller.rb`](app/controllers/api/videos_controller.rb): Returns a video's status and embed URL.
- [`app/javascript/components/video_uploader.js`](app/javascript/components/video_uploader.js): The tus-js-client upload.
- [`app/javascript/components/uploaded_video.js`](app/javascript/components/uploaded_video.js): Polls the status and renders the player.

tus-js-client is pinned from jsDelivr in [`config/importmap.rb`](config/importmap.rb), so there's no JavaScript build step.

The upload routes have no auth check. Put them behind your own sign-in before you deploy.

## Docs

- [TUS resumable uploads](https://docs.bunny.net/stream/tus-resumable-uploads)
