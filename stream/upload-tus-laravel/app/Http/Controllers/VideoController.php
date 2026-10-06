<?php

namespace App\Http\Controllers;

use App\Services\BunnyStream;
use Exception;
use Illuminate\Http\JsonResponse;

class VideoController extends Controller
{
    public function __invoke(BunnyStream $bunny, string $id): JsonResponse
    {
        // Require a signed-in user here, and check that they own this video ID. The route is public.
        try {
            return response()->json($bunny->getVideo($id));
        } catch (Exception $error) {
            // 404 when Bunny Stream has no such video, 502 for anything else.
            return response()->json(['error' => $error->getMessage()], $error->getCode() === 404 ? 404 : 502);
        }
    }
}
