# Searchable transcripts

A [Bunny Stream webhook](https://docs.bunny.net/stream/webhooks) handler running as a standalone Edge Script.

When captions are ready, each track is a WebVTT file at `/{video_id}/captions/{language}.vtt` on the library's CDN hostname. Strip the timestamps and you have a transcript you can search. The `?v=` uses the caption's `version`, so you never read a stale copy from cache. If the library uses token authentication, sign the caption URL before fetching it. Status 9 fires once per language, and each event re-reads every track, so upsert by video and language.

Handles status 9. Every other status gets a `200` and is ignored.

> [!WARNING]
> This example is for demo purposes. The `TODO` comments mark where your database, email provider or model goes.

## Environment

| Variable | Value |
| --- | --- |
| `STREAM_READ_ONLY_KEY` | The library's read-only API key, used to verify webhook signatures. `bunny stream libraries credentials <library> --read-only --show-secret` |
| `STREAM_API_KEY` | The library's API key, used to call the Stream API. `bunny stream libraries credentials <library> --show-secret` |
| `STREAM_CDN_HOSTNAME` | The library's CDN hostname, like `vz-abc123.b-cdn.net` |

## Deploy

```bash
npm install
bunny scripts create stream-webhook-searchable-transcripts --type standalone
bunny scripts env set STREAM_READ_ONLY_KEY <value> --secret
bunny scripts env set STREAM_API_KEY <value> --secret
bunny scripts env set STREAM_CDN_HOSTNAME <value>
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
body='{"VideoLibraryId":123456,"VideoGuid":"657bb740-a71b-4529-a012-528021c31a92","Status":9,"EventId":"test","Timestamp":"2026-01-01T00:00:00Z"}'
signature=$(printf '%s' "$body" | openssl dgst -sha256 -hmac "$STREAM_READ_ONLY_KEY" | sed 's/^.* //')
curl -X POST http://127.0.0.1:8080 \
  -H "X-BunnyStream-Signature-Version: v1" \
  -H "X-BunnyStream-Signature: $signature" \
  -d "$body"
```

The test event's `VideoGuid` must be a real video in your library, since the script looks it up.
