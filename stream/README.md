# Bunny Stream examples

Examples for playing, uploading, and reacting to video with [Bunny Stream](https://docs.bunny.net/stream).

## Bunny Player

Each app embeds [Bunny Player](https://docs.bunny.net/stream/player) and controls it with player.js. They all build the same demo page, so you can compare frameworks side by side.

| Example | Stack |
| --- | --- |
| [`player-react`](player-react) | React with Vite |
| [`player-nextjs`](player-nextjs) | Next.js App Router |
| [`player-vue`](player-vue) | Vue 3 with Vite |
| [`player-nuxt`](player-nuxt) | Nuxt 4 |
| [`player-sveltekit`](player-sveltekit) | SvelteKit with Svelte 5 |
| [`player-astro`](player-astro) | Astro |
| [`player-vanilla`](player-vanilla) | Vanilla TypeScript with Vite |

The player apps play a demo video straight after cloning:

```bash
cd stream/player-react
bun install
bun dev
```

## Uploads

The browser uploads video straight to Bunny Stream over [TUS](https://docs.bunny.net/stream/tus-resumable-uploads), with a small server route that creates each video and signs the upload. These need a library ID and API key in `.env`.

| Example | Stack |
| --- | --- |
| [`upload-tus-nextjs`](upload-tus-nextjs) | Next.js with tus-js-client |
| [`upload-tus-nuxt`](upload-tus-nuxt) | Nuxt 4 with tus-js-client |
| [`upload-tus-sveltekit`](upload-tus-sveltekit) | SvelteKit with tus-js-client |
| [`upload-tus-laravel`](upload-tus-laravel) | Laravel with tus-js-client |
| [`upload-tus-rails`](upload-tus-rails) | Rails with tus-js-client |
| [`upload-tus-django`](upload-tus-django) | Django with tus-js-client |
| [`upload-uppy-react`](upload-uppy-react) | Uppy Dashboard with React and Bun |

## Token authentication

With [token authentication](https://docs.bunny.net/stream/token-authentication) turned on, the player only loads embed URLs signed with your library's token authentication key. These apps sign the URL on the server, so the key never reaches the browser. They need a library ID, video ID, and key in `.env`.

| Example | Stack |
| --- | --- |
| [`player-token-auth-nextjs`](player-token-auth-nextjs) | Next.js App Router |
| [`player-token-auth-nuxt`](player-token-auth-nuxt) | Nuxt 4 |
| [`player-token-auth-sveltekit`](player-token-auth-sveltekit) | SvelteKit with Svelte 5 |

## Webhooks

Each folder is a standalone [Edge Script](https://docs.bunny.net/scripting) that handles [Bunny Stream webhooks](https://docs.bunny.net/stream/webhooks). They all verify the webhook signature with the library's read-only API key, then act on one or more video statuses. Live stream statuses (14 to 31) arrive on the same URL with `IsLiveStreamWebhook: true`, and these scripts ignore them. Each one deploys with `npm run deploy` after `bunny scripts create`, and its README lists the env vars it needs.

| Example | What it does |
| --- | --- |
| [`webhook-auto-collections`](webhook-auto-collections) | Sorts videos into collections by detected category |
| [`webhook-searchable-transcripts`](webhook-searchable-transcripts) | Turns captions into searchable transcripts |
| [`webhook-ai-title-review`](webhook-ai-title-review) | Sends AI titles and descriptions to Slack for review |
| [`webhook-chapters-moments`](webhook-chapters-moments) | Saves chapters and shareable moment links |
| [`webhook-playable-notification`](webhook-playable-notification) | Tells the uploader once the first resolution is playable |
| [`webhook-upload-rules`](webhook-upload-rules) | Deletes videos that are too long or too low resolution |
| [`webhook-shorts-feed`](webhook-shorts-feed) | Routes short vertical clips to a shorts feed |
| [`webhook-publish-gate`](webhook-publish-gate) | Publishes a video once every resolution is encoded |
| [`webhook-new-video-announcement`](webhook-new-video-announcement) | Posts new videos to Slack |
| [`webhook-thumbnail-blurhash`](webhook-thumbnail-blurhash) | Stores thumbnail blurhash placeholders |
| [`webhook-video-seo-jsonld`](webhook-video-seo-jsonld) | Builds `VideoObject` JSON-LD for search engines |
| [`webhook-video-sitemap`](webhook-video-sitemap) | Writes a video sitemap to Bunny Storage |
| [`webhook-encode-retry`](webhook-encode-retry) | Re-encodes a failed video once, then alerts Slack |
| [`webhook-failure-explanation`](webhook-failure-explanation) | Explains why encoding failed |
| [`webhook-duplicate-detection`](webhook-duplicate-detection) | Catches duplicate uploads by `originalHash` |
| [`webhook-storage-quotas`](webhook-storage-quotas) | Tracks storage per user for plan limits |
| [`webhook-direct-upload-status`](webhook-direct-upload-status) | Tracks server-side upload states for pre-signed uploads |
| [`webhook-delete-cleanup`](webhook-delete-cleanup) | Cleans up and purges the CDN when a video is deleted |
| [`webhook-pull-quotes`](webhook-pull-quotes) | Pulls timestamped quotes from captions for social posts |
| [`webhook-ai-feature-recovery`](webhook-ai-feature-recovery) | Alerts when captions or AI features fail |
