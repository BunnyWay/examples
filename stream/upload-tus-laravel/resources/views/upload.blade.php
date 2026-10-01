<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Upload to Bunny Stream with TUS</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <main>
        <h1>Upload to Bunny Stream with TUS</h1>
        <p>
            The browser sends the file straight to Bunny Stream. Pause it, or reload the page halfway
            through and pick the same file to carry on.
        </p>
        @if ($configured)
            <div id="uploader"></div>
        @else
            <div class="empty">
                Copy <code>.env.example</code> to <code>.env</code> and set
                <code>BUNNY_STREAM_LIBRARY_ID</code> and <code>BUNNY_STREAM_API_KEY</code>, then restart the
                dev server.
            </div>
        @endif
    </main>
</body>
</html>
