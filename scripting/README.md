# Bunny Edge Scripting examples

Standalone [Edge Scripts](https://docs.bunny.net/scripting) that run on bunny.net's edge with no origin server.

| Example | What it is |
| --- | --- |
| [`hono`](hono) | Hono API |
| [`elysia`](elysia) | Elysia API |
| [`h3`](h3) | h3 API |
| [`itty-router`](itty-router) | itty-router API |
| [`express`](express) | Express app |
| [`mcp-edge-scripts`](mcp-edge-scripts) | MCP server for managing Edge Scripts |

## Run locally

```bash
cd scripting/hono
npm install
npm run dev
```

## Deploy

With the [bunny CLI](https://docs.bunny.net/cli):

```bash
bunny scripts create my-hono-api --type standalone
npm run deploy
```
