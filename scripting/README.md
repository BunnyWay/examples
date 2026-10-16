# Bunny Edge Scripting examples

These examples run on [Edge Scripting](https://docs.bunny.net/scripting), bunny.net's JavaScript and TypeScript runtime at the edge. Each one is a standalone Edge Script with no origin server.

## Frameworks

The same small API built with five JavaScript frameworks. Every example serves the same routes, so you can compare them side by side:

| Route | Response |
| --- | --- |
| `GET /` | A plain-text greeting |
| `GET /hello/:name` | `{"message":"Hello, <name>!"}` |
| `POST /echo` | Echoes `{"message": "..."}` back, or a 400 if the body isn't valid |
| Anything else | A 404 |

| Example | How it plugs in | Bundle |
| --- | --- | --- |
| [`hono`](hono) | `app.fetch` | ~70 KB |
| [`elysia`](elysia) | `app.fetch` | ~800 KB |
| [`h3`](h3) | `app.fetch` | ~70 KB |
| [`itty-router`](itty-router) | `router.fetch` | ~14 KB |
| [`express`](express) | Converts between `Request` and Node's `req` and `res` with fetch-to-node | ~1.2 MB |

To run one locally and deploy it with the [bunny CLI](https://docs.bunny.net/cli):

```bash
cd scripting/hono
npm install
npm run dev

bunny scripts create my-hono-api --type standalone
npm run deploy
```

`npm run deploy` bundles `src/main.ts` into a single `dist/main.js` and publishes it with `bunny scripts deploy`.

## MCP server

| Example | What it shows |
| --- | --- |
| [`mcp-edge-scripts`](mcp-edge-scripts) | An MCP server that manages your Edge Scripts, passing each client's API key through to the bunny.net API |

It's built on the MCP TypeScript SDK's `createMcpHandler`, which is also a fetch handler, so it runs on Edge Scripting the same way the frameworks do.

## Any fetch handler works

`BunnySDK.net.http.serve` takes a function from `Request` to `Response`, so you can pass it any framework's `fetch` method directly:

```ts
import * as BunnySDK from "@bunny.net/edgescript-sdk";

BunnySDK.net.http.serve(app.fetch);
```

Frameworks built on Node's `http` module, like Express, need an adapter in between. The [`express`](express) example shows one.

## TypeScript

`npm run typecheck` runs `tsc` with `noUncheckedIndexedAccess` and the unused-code checks switched on in each `tsconfig.json`. Request bodies are typed as `unknown` and narrowed with a validator or a type guard instead of a cast.
