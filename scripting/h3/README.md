# h3 on Bunny Edge Scripting

An [h3](https://h3.dev) API that runs as a standalone Edge Script instead of on an origin server.

```bash
npm install
npm run dev
```

The script runs at http://127.0.0.1:8080 and reloads on save. Try the routes:

```bash
curl http://127.0.0.1:8080/hello/bunny
curl -X POST http://127.0.0.1:8080/echo -H "content-type: application/json" -d '{"message":"hi"}'
```

> [!NOTE]
> Under `npm run dev`, h3's error responses (the 400s and 404s) come back as `[object Response]` with a 200. The Bunny SDK's local Node server replaces the global `Response` after h3 has loaded, so h3 stops recognizing the responses it builds. Successful routes work locally, and the built bundle in `dist/main.js` returns every response correctly.

## Deploy

```bash
bunny scripts create my-h3-api --type standalone
npm run deploy
```

`bunny scripts create` makes the script with a pull zone in front of it and writes `.bunny/script.json` to link the folder. `npm run deploy` bundles [`src/main.ts`](src/main.ts) into `dist/main.js`, then publishes it with `bunny scripts deploy` and prints the live URL.

## How it works

h3 v2 is built on web standards, so `app.fetch` takes a `Request` and returns a `Response`, which is what `BunnySDK.net.http.serve` expects:

```ts
BunnySDK.net.http.serve(app.fetch);
```

Handlers return plain objects for JSON, and throwing an `HTTPError` sends the status and message back as JSON. `readBody` answers malformed JSON with a 400 on its own and hands back `unknown`, which a type guard narrows. h3 also answers unknown routes with a 404.

The build uses `--platform browser`, which picks the web-standard build of every package, so the bundle needs nothing from Node. The bundle is about 70 KB.

`npm run typecheck` checks the code against the strict options in [`tsconfig.json`](tsconfig.json).

## Docs

- [Standalone scripts](https://docs.bunny.net/scripting/standalone/overview)
- [`bunny scripts` CLI](https://docs.bunny.net/cli/commands/scripts)
- [h3](https://h3.dev)
