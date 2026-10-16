# MCP server for Edge Scripts, running on Edge Scripting

An [MCP](https://modelcontextprotocol.io) server that manages your bunny.net Edge Scripts, deployed as an Edge Script itself. Point Claude, Cursor, or any MCP client at it and ask it to list, write, publish, and configure scripts.

The server holds no API key of its own. Each client sends its bunny.net API key in the `Authorization` header, and the server passes that key straight through to the [Edge Scripting API](https://docs.bunny.net/scripting/api-reference) as the `AccessKey` header. Nothing is stored, so one deployment can serve as many accounts as you like.

```bash
npm install
npm run dev
```

The server listens on `http://127.0.0.1:8080/mcp`.

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
claude mcp add --transport http bunny-scripts https://your-script.b-cdn.net/mcp \
  --header "Authorization: Bearer $BUNNY_API_KEY"
```

Any client that takes a JSON config:

```json
{
  "mcpServers": {
    "bunny-scripts": {
      "url": "https://your-script.b-cdn.net/mcp",
      "headers": { "Authorization": "Bearer YOUR_API_KEY" }
    }
  }
}
```

You can also call it with curl. `AccessKey: <key>` works as well as the `Authorization` header:

```bash
curl https://your-script.b-cdn.net/mcp \
  -H "AccessKey: $BUNNY_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_scripts","arguments":{}}}'
```

## Tools

| Tool | What it does |
| --- | --- |
| `list_scripts` | List scripts, with an optional name search |
| `get_script` | Get a script's details, linked pull zones, and variables |
| `create_script` | Create a standalone or middleware script, with a pull zone by default |
| `update_script` | Rename a script or change its type |
| `delete_script` | Delete a script, and optionally its linked pull zones |
| `get_script_code` | Read the saved code |
| `set_script_code` | Save new code |
| `publish_script` | Publish the saved code as a new release |
| `list_releases` | List published releases |
| `get_statistics` | Requests and CPU time over a date range |
| `set_variable` / `delete_variable` | Manage environment variables |
| `list_secrets` / `set_secret` / `delete_secret` | Manage secrets |

Saving code and publishing it are separate steps, the same as the dashboard editor, so a client can show you the code before it goes live. Tools that only read are marked `readOnlyHint`, and the deletes are marked `destructiveHint`, so clients can ask before running them.

## How it works

The server uses v2 of the [MCP TypeScript SDK](https://ts.sdk.modelcontextprotocol.io/v2/), from `@modelcontextprotocol/server`. [`src/main.ts`](src/main.ts) reads the key from `Authorization: Bearer <key>` (or `AccessKey`) and returns `401` if there isn't one. Otherwise it hands the request to `createMcpHandler` with the key as `authInfo`:

```ts
const mcp = createMcpHandler(({ authInfo }) => {
  // ...
  return createMcpServer(createComputeClient({ apiKey: authInfo.token }));
});

return mcp.fetch(request, { authInfo });
```

`createMcpHandler` calls the factory once per request, so each request gets a fresh `McpServer` bound to its caller's key, and nothing is kept in memory between requests. It serves clients on the [2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28) protocol revision and falls back to stateless Streamable HTTP for clients on the 2025 revisions.

[`src/tools.ts`](src/tools.ts) registers each tool with a Zod 4 input schema and calls the Edge Scripting API through [`@bunny.net/openapi-client`](https://www.npmjs.com/package/@bunny.net/openapi-client). Its compute client is typed from bunny.net's OpenAPI spec, so paths, parameters, and request bodies are checked at compile time, and it sends the caller's key as `AccessKey`. If bunny.net rejects a call, the client throws an `ApiError` with the API's message, and the tool returns that message as an error result so the model can see why the call failed.

`npm run typecheck` checks the code against the strict options in [`tsconfig.json`](tsconfig.json).

## Docs

- [Edge Scripting](https://docs.bunny.net/scripting)
- [Edge Scripting API](https://docs.bunny.net/scripting/api-reference)
- [MCP TypeScript SDK v2](https://ts.sdk.modelcontextprotocol.io/v2/)
