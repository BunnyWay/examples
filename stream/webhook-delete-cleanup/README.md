# Clean up when a video is deleted

A [Bunny Stream webhook](https://docs.bunny.net/stream/webhooks) handler running as a standalone Edge Script.

Status 32 fires once for every deleted video, including each video inside a deleted collection. The video is already gone when the event arrives, so the script works from the GUID alone. It purges the cached watch page from the CDN, which needs your account API key.

Handles status 32. Every other status gets a `200` and is ignored.

> [!WARNING]
> This example is for demo purposes. The `TODO` comments mark where your database, email provider or model goes.

## Environment

| Variable | Value |
| --- | --- |
| `STREAM_READ_ONLY_KEY` | The library's read-only API key, used to verify webhook signatures. `bunny stream libraries credentials <library> --read-only --show-secret` |
| `BUNNY_API_KEY` | Your account API key, used to purge the CDN. Find it in the [dashboard](https://dash.bunny.net/account/settings) |

## Deploy

```bash
npm install
bunny scripts create stream-webhook-delete-cleanup --type standalone
bunny scripts env set STREAM_READ_ONLY_KEY <value> --secret
bunny scripts env set BUNNY_API_KEY <value> --secret
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
body='{"VideoLibraryId":123456,"VideoGuid":"657bb740-a71b-4529-a012-528021c31a92","Status":32,"EventId":"test","Timestamp":"2026-01-01T00:00:00Z"}'
signature=$(printf '%s' "$body" | openssl dgst -sha256 -hmac "$STREAM_READ_ONLY_KEY" | sed 's/^.* //')
curl -X POST http://127.0.0.1:8080 \
  -H "X-BunnyStream-Signature-Version: v1" \
  -H "X-BunnyStream-Signature: $signature" \
  -d "$body"
```
