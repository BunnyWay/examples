# Upload to Bunny Stream with TUS in Laravel

In this Laravel app, the browser uploads videos straight to Bunny Stream over [TUS](https://tus.io) and plays them back once they've encoded.

```bash
cp .env.example .env
composer install
php artisan key:generate
bun install
composer run dev
```

Set `BUNNY_STREAM_LIBRARY_ID` and `BUNNY_STREAM_API_KEY` from your library's **API** page, then open http://localhost:8000 and choose a video. `composer run dev` starts the PHP server and Vite together. No database is needed.

## How it works

1. The server creates a video through the Bunny Stream API and signs the upload.
2. tus-js-client sends the file straight to Bunny Stream, with pause and resume.
3. The page polls the video's status and shows Bunny Player once encoding is done.

If you reload mid-upload and pick the same file again, the server re-signs the same video and the upload carries on where it stopped.

## Where the code lives

- [`app/Services/BunnyStream.php`](app/Services/BunnyStream.php): Bunny Stream API calls and signing.
- [`routes/api.php`](routes/api.php): The two API routes the browser calls.
- [`app/Http/Controllers/UploadController.php`](app/Http/Controllers/UploadController.php): Creates and signs a video, or re-signs an unfinished one.
- [`app/Http/Controllers/VideoController.php`](app/Http/Controllers/VideoController.php): Returns a video's status and embed URL.
- [`resources/js/video-uploader.js`](resources/js/video-uploader.js): The tus-js-client upload.
- [`resources/js/uploaded-video.js`](resources/js/uploaded-video.js): Polls the status and renders the player.

The upload routes have no auth check. Put them behind your own sign-in before you deploy.

## Docs

- [TUS resumable uploads](https://docs.bunny.net/stream/tus-resumable-uploads)
