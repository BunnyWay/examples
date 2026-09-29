<?php

namespace App\Http\Controllers;

use App\Services\BunnyStream;
use Exception;
use Illuminate\Http\JsonResponse;

class VideoController extends Controller
{
    public function __invoke(BunnyStream $bunny, string $id): JsonResponse
    {
        try {
            return response()->json($bunny->getVideo($id));
        } catch (Exception $error) {
            return response()->json(['error' => $error->getMessage()], 502);
        }
    }
}
