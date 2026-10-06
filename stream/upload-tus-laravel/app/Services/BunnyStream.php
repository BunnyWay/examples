<?php

namespace App\Services;

use Illuminate\Container\Attributes\Config;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

final readonly class BunnyStream
{
    // Bunny Stream status for a video that is still waiting for its file.
    public const int STATUS_CREATED = 0;

    // Long enough for a slow upload to finish. Bunny checks the expiry on every TUS request.
    private const int SIGNATURE_TTL_SECONDS = 24 * 60 * 60;

    public function __construct(
        #[Config('services.bunny_stream.library_id')] private ?string $libraryId,
        #[Config('services.bunny_stream.api_key')] private ?string $apiKey,
    ) {}

    public function isConfigured(): bool
    {
        return filled($this->libraryId) && filled($this->apiKey);
    }

    /**
     * @return array{status: int, encodeProgress: int, embedUrl: string}
     */
    public function getVideo(string $videoId): array
    {
        $video = $this->stream()->get('/videos/'.rawurlencode($videoId))->json();

        return [
            'status' => $video['status'],
            'encodeProgress' => $video['encodeProgress'],
            'embedUrl' => "https://player.mediadelivery.net/embed/{$this->libraryId}/{$videoId}",
        ];
    }

    public function createVideo(string $title): string
    {
        return $this->stream()->post('/videos', ['title' => $title])->json('guid');
    }

    /**
     * @return array{videoId: string, libraryId: string, expirationTime: int, signature: string}
     */
    public function signUpload(string $videoId): array
    {
        $this->ensureConfigured();
        $expirationTime = time() + self::SIGNATURE_TTL_SECONDS;
        $signature = hash('sha256', $this->libraryId.$this->apiKey.$expirationTime.$videoId);

        return [
            'videoId' => $videoId,
            'libraryId' => $this->libraryId,
            'expirationTime' => $expirationTime,
            'signature' => $signature,
        ];
    }

    private function stream(): PendingRequest
    {
        $this->ensureConfigured();

        return Http::baseUrl("https://video.bunnycdn.com/library/{$this->libraryId}")
            ->withHeaders(['AccessKey' => $this->apiKey])
            ->acceptJson()
            ->throw(fn (Response $response) => throw new RuntimeException(
                "Bunny Stream returned {$response->status()}: {$response->body()}",
                $response->status(),
            ));
    }

    private function ensureConfigured(): void
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('Set BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_API_KEY in .env');
        }
    }
}
