# MCP server for Edge Scripts, running on Edge Scripting

An [MCP](https://modelcontextprotocol.io) server that manages your bunny.net Edge Scripts, deployed as an Edge Script itself. Point Claude, Cursor, or any MCP client at it and ask it to list, write, publish, and configure scripts.

The server holds no API key of its own. Each client sends its bunny.net API key in the `Authorization` header, and the server passes that key straight through to the [Edge Scripting API](https://docs.bunny.net/scripting/api-reference) as the `AccessKey` header. Nothing is stored, so one deployment can serve as many accounts as you like.

```bash
npm install
npm run dev
```

The server answers MCP requests at `http://127.0.0.1:8080`, and at `/mcp` for clients that expect that path.

## Deploy

```bash
bunny scripts create my-mcp-server --type standalone
npm run deploy
```

`bunny scripts create` makes the script with a pull zone in front of it and writes `.bunny/script.json` to link the folder. `npm run deploy` bundles [`src/main.ts`](src/main.ts) into `dist/main.js`, then publishes it with `bunny scripts deploy` and prints the live URL.

To deploy from GitHub instead, build in a workflow and hand the output to the [deploy action](https://docs.bunny.net/scripting/github-actions). The script ID and deploy key are under **Deployments** → **Settings**.

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 22
- run: npm ci && npm run build
  working-directory: scripting/mcp-edge-scripts
- uses: BunnyWay/actions/deploy-script@main
  with:
    script_id: ${{ secrets.SCRIPT_ID }}
    deploy_key: ${{ secrets.DEPLOY_KEY }}
    file: scripting/mcp-edge-scripts/dist/main.js
```

## Connect a client

Use your API key from **Account settings** → **API Keys** in the [dashboard](https://dash.bunny.net/account/settings).

Claude Code:

```bash
claude mcp add --transport http bunny-scripts https://your-script.b-cdn.net \
  --header "Authorization: Bearer $BUNNY_API_KEY"
```

Any client that takes a JSON config:

```json
{
  "mcpServers": {
    "bunny-scripts": {
      "url": "https://your-script.b-cdn.net",
      "headers": { "Authorization": "Bearer YOUR_API_KEY" }
    }
  }
}
```

You can also call it with curl. `AccessKey: <key>` works as well as the `Authorization` header:

```bash
curl https://your-script.b-cdn.net \
  -H "AccessKey: $BUNNY_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_scripts","arguments":{}}}'
```

## Tools

| Tool | What it does |
| --- | --- |
| `list_scripts` | List scripts, with an optional name search |
| `get_script` | Get a script's details, saved code, variables, secret names, and last five releases in one call, plus any env names the code reads that have no value |
| `get_statistics` | Requests and CPU time over a date range |
| `create_script` | Create a standalone or middleware script, with a pull zone by default, set its variables and secrets, and optionally publish its code |
| `update_script` | Rename a script, change its type, save new code, set variables and secrets, and publish, in any combination |
| `set_env` | Set an environment variable, or a secret with `secret: true` |
| `delete_env` | Delete a variable or secret by name |
| `delete_script` | Delete a script, and optionally its linked pull zones |

The tools follow tasks rather than API endpoints, so a client deploys new code with one `update_script` call instead of chaining several. Code is saved without publishing unless the call sets `publish: true`, the same as the dashboard editor's **Save** and **Publish**. Read-only tools are marked `readOnlyHint` and the deletes `destructiveHint`, so clients can ask before running them.

### Environment variables

`create_script` and `update_script` take `variables` and `secrets` as maps of names to values, and set them before publishing, so the first release goes live with its environment in place. Before publishing, the server looks for the env names the code reads, from `process.env.NAME`, `process.env["NAME"]`, and `Deno.env.get("NAME")`. If any of them has no variable or secret, the code is saved but not published, and the result lists the names under `missingEnv`. The model then asks you for the values and calls `update_script` again with `publish: true`.

Names that bundled libraries read for themselves, such as `NODE_ENV` and `DEBUG`, are skipped. Pass `ignoreEnv` for any others the code doesn't need. A lookup with a computed name, like `process.env[key]`, can't be found by reading the code, so it never blocks a publish.

The server doesn't use MCP elicitation to ask for the values. Secrets are exactly the kind of sensitive input the spec says not to collect through elicitation forms, and clients on the 2025 protocol revisions can't receive elicitation requests from a stateless server.

Responses never include a script's deployment key, since it can publish code to the script without an API key.

## How it works

The server uses v2 of the [MCP TypeScript SDK](https://ts.sdk.modelcontextprotocol.io/v2/), from `@modelcontextprotocol/server`. [`src/main.ts`](src/main.ts) serves MCP at `/` and `/mcp`. It reads the key from `Authorization: Bearer <key>` (or `AccessKey`) and returns `401` if there isn't one. Otherwise it hands the request to `createMcpHandler` with the key as `authInfo`:

```ts
const mcp = createMcpHandler(({ authInfo }) => {
  // ...
  return createMcpServer(createComputeClient({ apiKey: authInfo.token }));
});

return mcp.fetch(request, { authInfo });
```

`createMcpHandler` calls the factory once per request, so each request gets a fresh `McpServer` bound to its caller's key, and nothing is kept in memory between requests. It serves clients on the [2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28) protocol revision and falls back to stateless Streamable HTTP for clients on the 2025 revisions.

[`src/tools.ts`](src/tools.ts) registers each tool with a Zod 4 input schema and calls the Edge Scripting API through [`@bunny.net/openapi-client`](https://www.npmjs.com/package/@bunny.net/openapi-client). Its compute client is typed from bunny.net's OpenAPI spec, so paths, parameters, and request bodies are checked at compile time, and it sends the caller's key as `AccessKey`. If bunny.net rejects a call, the client throws an `ApiError` with the API's message, and the tool returns that message as an error result so the model can see why the call failed.

The endpoint follows the [Streamable HTTP transport](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http). It only accepts POST, so GET and DELETE get a `405`. A request with an `Origin` header from any hostname other than the script's own gets a `403`, which stops web pages on other sites, and DNS rebinding attacks, from reaching it. MCP clients that aren't browsers don't send `Origin`, so they're unaffected. When a client disconnects, the server cancels any bunny.net calls still in flight for that request.

`npm run typecheck` checks the code against the strict options in [`tsconfig.json`](tsconfig.json).

## Docs

- [Edge Scripting](https://docs.bunny.net/scripting)
- [Edge Scripting API](https://docs.bunny.net/scripting/api-reference)
- [MCP TypeScript SDK v2](https://ts.sdk.modelcontextprotocol.io/v2/)
