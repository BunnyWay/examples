# Keep a video sitemap up to date

A [Bunny Stream webhook](https://docs.bunny.net/stream/webhooks) handler running as a standalone Edge Script.

When a video finishes encoding or is deleted, this script lists the library's playable videos and writes a [video sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps) to Bunny Storage as `sitemap-videos.xml`. Serve the storage zone through a pull zone and point search engines at it. No database needed.

Handles status 3 and 32. Every other status gets a `200` and is ignored.

> [!WARNING]
> This example is for demo purposes. Change `WATCH_URL` in [`src/main.ts`](src/main.ts) to your own watch pages.

## Environment

| Variable | Value |
| --- | --- |
| `STREAM_READ_ONLY_KEY` | The library's read-only API key, used to verify webhook signatures. `bunny stream libraries credentials <library> --read-only --show-secret` |
| `STREAM_API_KEY` | The library's API key, used to list videos. `bunny stream libraries credentials <library> --show-secret` |
| `STREAM_CDN_HOSTNAME` | The library's CDN hostname, like `vz-abc123.b-cdn.net`, used for thumbnail URLs |
| `STORAGE_ZONE_NAME` | The storage zone the sitemap is written to |
| `STORAGE_ZONE_PASSWORD` | The storage zone's password, from its **FTP & API Access** tab |
| `STORAGE_HOSTNAME` | The storage zone's region endpoint, like `storage.bunnycdn.com` or `uk.storage.bunnycdn.com` |

## Deploy

```bash
npm install
bunny scripts create stream-webhook-video-sitemap --type standalone
bunny scripts env set STREAM_READ_ONLY_KEY <value> --secret
bunny scripts env set STREAM_API_KEY <value> --secret
bunny scripts env set STREAM_CDN_HOSTNAME <value>
bunny scripts env set STORAGE_ZONE_NAME <value>
bunny scripts env set STORAGE_ZONE_PASSWORD <value> --secret
bunny scripts env set STORAGE_HOSTNAME <value>
npm run deploy
```

Then point your library's webhook at the script's URL:

```bash
bunny api POST /videolibrary/<library-id> --body '{"WebhookUrl":"https://<your-script>.b-cdn.net"}'
```

## Run locally

```bash
cp .env.example .env
npm install
npm run dev
```

The script runs at http://127.0.0.1:8080. Send it a signed test event:

```bash
source .env
body='{"VideoLibraryId":123456,"VideoGuid":"657bb740-a71b-4529-a012-528021c31a92","Status":3,"EventId":"test","Timestamp":"2026-01-01T00:00:00Z"}'
signature=$(printf '%s' "$body" | openssl dgst -sha256 -hmac "$STREAM_READ_ONLY_KEY" | sed 's/^.* //')
curl -X POST http://127.0.0.1:8080 \
  -H "X-BunnyStream-Signature-Version: v1" \
  -H "X-BunnyStream-Signature: $signature" \
  -d "$body"
```

The test event's `VideoLibraryId` must be your real library ID, since the script lists its videos.
