# MCP server for Edge Scripts

An [MCP](https://modelcontextprotocol.io) server running as an Edge Script. It lets Claude, Cursor, or any MCP client list, write, publish, and configure your bunny.net Edge Scripts. Each client sends their bunny.net API key which is passed straight through.

## Run locally

```bash
npm install
npm run dev
```

The server runs at http://127.0.0.1:8080 (and `/mcp`).

## Deploy

```bash
bunny scripts create my-mcp-server --type standalone
npm run deploy
```

Then connect a client with your API key from the [dashboard](https://dash.bunny.net/account/settings):

```bash
claude mcp add --transport http bunny-scripts https://your-script.b-cdn.net \
  --header "Authorization: Bearer $BUNNY_API_KEY"
```
