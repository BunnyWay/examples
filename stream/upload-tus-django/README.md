# Upload to Bunny Stream with TUS in Django

In this Django app, the browser uploads videos straight to Bunny Stream over [TUS](https://tus.io) and plays them back once they've encoded.

```bash
cp .env.example .env
uv run --env-file .env manage.py runserver
```

Set `BUNNY_STREAM_LIBRARY_ID` and `BUNNY_STREAM_API_KEY` from your library's **API** page, then open http://localhost:8000 and choose a video. `uv run` installs Django on the first run, and `--env-file` loads the two values into the server's environment.

## How it works

1. The server creates a video through the Bunny Stream API and signs the upload.
2. tus-js-client sends the file straight to Bunny Stream, with pause and resume.
3. The page polls the video's status and shows Bunny Player once encoding is done.

If you reload mid-upload and pick the same file again, the server re-signs the same video and the upload carries on where it stopped.

## Where the code lives

- [`uploads/bunny_stream.py`](uploads/bunny_stream.py): Server-only Bunny Stream API calls and signing.
- [`uploads/views.py`](uploads/views.py): Creates and signs a video, or re-signs an unfinished one, and returns a video's status and embed URL.
- [`uploads/static/uploads/video-uploader.js`](uploads/static/uploads/video-uploader.js): The tus-js-client upload.
- [`uploads/static/uploads/uploaded-video.js`](uploads/static/uploads/uploaded-video.js): Polls the status and renders the player.

The upload routes have no auth check. Put them behind your own sign-in before you deploy.

## Docs

- [TUS resumable uploads](https://docs.bunny.net/stream/tus-resumable-uploads)
