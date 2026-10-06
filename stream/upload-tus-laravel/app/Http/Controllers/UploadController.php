<?php

namespace App\Http\Controllers;

use App\Services\BunnyStream;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function __construct(private readonly BunnyStream $bunny) {}

    // Creates a video and signs a TUS upload for it. Pass the videoId of an
    // unfinished upload to re-sign it, so the browser can resume.
    public function __invoke(Request $request): JsonResponse
    {
        // Require a signed-in user here. This route is public and creates videos in your library.
        // Before re-signing a videoId, check that the user owns it.
        $title = $request->input('title');
        $videoId = $request->input('videoId');
        if (! is_string($title) || trim($title) === '') {
            return response()->json(['error' => 'title is required'], 400);
        }

        try {
            if (is_string($videoId) && $this->canResume($videoId)) {
                return response()->json($this->bunny->signUpload($videoId));
            }

            return response()->json($this->bunny->signUpload($this->bunny->createVideo($title)));
        } catch (Exception $error) {
            return response()->json(['error' => $error->getMessage()], 502);
        }
    }

    // Only re-sign videos that are still waiting for their file.
    private function canResume(string $videoId): bool
    {
        try {
            return $this->bunny->getVideo($videoId)['status'] === BunnyStream::STATUS_CREATED;
        } catch (Exception) {
            return false;
        }
    }
}
