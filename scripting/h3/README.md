# h3 on Bunny Edge Scripting

An [h3](https://h3.dev) API running as a standalone Edge Script.

## Run locally

```bash
npm install
npm run dev
```

The script runs at http://127.0.0.1:8080.

> [!NOTE]
> Under `npm run dev`, h3's 400 and 404 responses come back as `[object Response]`. The deployed bundle is unaffected.

## Deploy

```bash
bunny scripts create my-h3-api --type standalone
npm run deploy
```
