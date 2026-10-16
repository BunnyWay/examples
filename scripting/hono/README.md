# Hono on Bunny Edge Scripting

A [Hono](https://hono.dev) API that runs as a standalone Edge Script instead of on an origin server.

```bash
npm install
npm run dev
```

The script runs at http://127.0.0.1:8080 and reloads on save. Try the routes:

```bash
curl http://127.0.0.1:8080/hello/bunny
curl -X POST http://127.0.0.1:8080/echo -H "content-type: application/json" -d '{"message":"hi"}'
```

## Deploy

```bash
bunny scripts create my-hono-api --type standalone
npm run deploy
```

`bunny scripts create` makes the script with a pull zone in front of it and writes `.bunny/script.json` to link the folder. `npm run deploy` bundles [`src/main.ts`](src/main.ts) into `dist/main.js`, then publishes it with `bunny scripts deploy` and prints the live URL.

## How it works

Hono is built on web standards, so `app.fetch` takes a `Request` and returns a `Response`, which is what `BunnySDK.net.http.serve` expects:

```ts
BunnySDK.net.http.serve(app.fetch);
```

Everything else in [`src/main.ts`](src/main.ts) is plain Hono. `POST /echo` checks its body with Hono's built-in `validator`, so `c.req.valid("json")` is typed without a schema library, and `onError` turns Hono's `HTTPException`s, such as malformed JSON, into JSON errors.

The build uses `--platform browser`, which picks the web-standard build of every package, so the bundle needs nothing from Node. The bundle is about 70 KB.

`npm run typecheck` checks the code against the strict options in [`tsconfig.json`](tsconfig.json).

## Docs

- [Standalone scripts](https://docs.bunny.net/scripting/standalone/overview)
- [`bunny scripts` CLI](https://docs.bunny.net/cli/commands/scripts)
- [Hono](https://hono.dev/docs)
