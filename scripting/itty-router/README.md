# itty-router on Bunny Edge Scripting

An [itty-router](https://itty.dev/itty-router) API that runs as a standalone Edge Script instead of on an origin server. At about 14 KB bundled, it's the smallest of these examples.

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
bunny scripts create my-itty-router-api --type standalone
npm run deploy
```

`bunny scripts create` makes the script with a pull zone in front of it and writes `.bunny/script.json` to link the folder. `npm run deploy` bundles [`src/main.ts`](src/main.ts) into `dist/main.js`, then publishes it with `bunny scripts deploy` and prints the live URL.

## How it works

`AutoRouter` has a `fetch` method that takes a `Request` and returns a `Response`, so you can pass it to `BunnySDK.net.http.serve`:

```ts
BunnySDK.net.http.serve(router.fetch);
```

`AutoRouter` formats returned objects as JSON, answers unknown routes with a 404, and turns thrown errors into a 500. Route params are on `request.params`.

The build uses `--platform browser`, which picks the web-standard build of every package, so the bundle needs nothing from Node.

`npm run typecheck` checks the code against the strict options in [`tsconfig.json`](tsconfig.json).

## Docs

- [Standalone scripts](https://docs.bunny.net/scripting/standalone/overview)
- [`bunny scripts` CLI](https://docs.bunny.net/cli/commands/scripts)
- [itty-router](https://itty.dev/itty-router)
