# Express on Bunny Edge Scripting

An [Express 5](https://expressjs.com) app that runs as a standalone Edge Script instead of on an origin server. The app in [`src/app.ts`](src/app.ts) is ordinary Express, and [`src/main.ts`](src/main.ts) bridges it to the edge.

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
bunny scripts create my-express-api --type standalone
npm run deploy
```

`bunny scripts create` makes the script with a pull zone in front of it and writes `.bunny/script.json` to link the folder. `npm run deploy` bundles the app into `dist/main.js`, then publishes it with `bunny scripts deploy` and prints the live URL.

## How it works

An Edge Script answers a web `Request` with a `Response`, but Express expects Node's `req` and `res` from `node:http`. [fetch-to-node](https://github.com/mhart/fetch-to-node) converts between the two:

```ts
BunnySDK.net.http.serve((request) => {
  const { req, res } = toReqRes(request, {
    createIncomingMessage: () => new EdgeIncomingMessage(),
  });

  app(req, res);

  return toFetchResponse(res);
});
```

Two more pieces make Express work on top of it:

- Express swaps the prototype of every `req` and `res` for its own, which extend `node:http`. `src/main.ts` points those prototypes at the fetch-to-node classes once at startup, so `res.json()` and friends write to a response that can be turned back into a `Response`.
- There's no TCP socket at the edge. `express.json()` treats a request without a readable socket as already finished and skips the body, so `EdgeIncomingMessage` hands it a stand-in socket.

The build leaves the `node:` built-ins Express needs as imports for the runtime to provide. The runtime doesn't allow `node:tty`, which the Node build of the `debug` package requires, so the build aliases `debug` to its browser build. The bundle is about 1.2 MB, well under the 10 MB script limit.

`npm run typecheck` checks the code against the strict options in [`tsconfig.json`](tsconfig.json).

## Bringing your own app

Replace `src/app.ts` with your Express app and keep `src/main.ts` as it is. Anything that needs a long-lived server won't carry over: `app.listen`, WebSocket upgrades, and middleware that reads the raw socket. Check the [runtime limits](https://docs.bunny.net/scripting/limits) too, such as 128 MB of memory and 50 subrequests per request.

## Docs

- [Standalone scripts](https://docs.bunny.net/scripting/standalone/overview)
- [`bunny scripts` CLI](https://docs.bunny.net/cli/commands/scripts)
- [Express](https://expressjs.com/en/5x/api.html)
