# Elysia on Bunny Edge Scripting

An [Elysia](https://elysiajs.com) API that runs as a standalone Edge Script instead of on an origin server.

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
bunny scripts create my-elysia-api --type standalone
npm run deploy
```

`bunny scripts create` makes the script with a pull zone in front of it and writes `.bunny/script.json` to link the folder. `npm run deploy` bundles [`src/main.ts`](src/main.ts) into `dist/main.js`, then publishes it with `bunny scripts deploy` and prints the live URL.

## How it works

Elysia's `app.fetch` takes a `Request` and returns a `Response`, so you can pass it to `BunnySDK.net.http.serve`:

```ts
BunnySDK.net.http.serve(app.fetch);
```

`POST /echo` validates its body with Elysia's `t.Object` schema, and `onError` turns parse and validation failures into a 400. The error hook is registered before the routes because Elysia only applies hooks to routes added after them.

Elysia is written with Bun in mind, but nothing here uses Bun APIs. The build uses `--platform browser`, which picks the web-standard build of every package, so the bundle needs nothing from Node. The bundle is about 800 KB, well under the 10 MB script limit.

`npm run typecheck` checks the code against the strict options in [`tsconfig.json`](tsconfig.json).

## Docs

- [Standalone scripts](https://docs.bunny.net/scripting/standalone/overview)
- [`bunny scripts` CLI](https://docs.bunny.net/cli/commands/scripts)
- [Elysia](https://elysiajs.com)
