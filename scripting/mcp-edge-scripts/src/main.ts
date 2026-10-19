import * as BunnySDK from "@bunny.net/edgescript-sdk";
import { createComputeClient } from "@bunny.net/openapi-client/compute";
import {
  type AuthInfo,
  createMcpHandler,
  originValidationResponse,
} from "@modelcontextprotocol/server";
import { createMcpServer } from "./tools.ts";

function getAccessKey(request: Request): string | null {
  const authorization = request.headers.get("Authorization");
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

  return bearer || request.headers.get("AccessKey")?.trim() || null;
}

const mcp = createMcpHandler(({ authInfo, requestInfo }) => {
  if (!authInfo) {
    throw new Error("createMcpHandler was called without authInfo");
  }

  const bunny = createComputeClient({
    apiKey: authInfo.token,
    userAgent: "bunny-edge-scripts-mcp",
  });

  const signal = requestInfo?.signal;
  if (signal) {
    bunny.use({ onRequest: ({ request }) => new Request(request, { signal }) });
  }

  return createMcpServer(bunny);
});

function unauthorized(): Response {
  return Response.json(
    {
      error: "invalid_token",
      error_description:
        "Send your bunny.net API key as `Authorization: Bearer <key>`",
    },
    {
      status: 401,
      headers: { "WWW-Authenticate": 'Bearer realm="bunny.net"' },
    },
  );
}

const MCP_PATHS = new Set(["/", "/mcp"]);

BunnySDK.net.http.serve((request) => {
  const url = new URL(request.url);

  if (!MCP_PATHS.has(url.pathname)) {
    return new Response("Not found", { status: 404 });
  }

  const forbidden = originValidationResponse(request, [url.hostname]);
  if (forbidden) {
    return forbidden;
  }

  if (request.method !== "POST") {
    return new Response(
      "bunny.net Edge Scripts MCP server. Connect your MCP client to this URL.\n",
      { status: 405, headers: { Allow: "POST" } },
    );
  }

  const accessKey = getAccessKey(request);

  if (!accessKey) {
    return unauthorized();
  }

  const authInfo: AuthInfo = {
    token: accessKey,
    clientId: "bunny.net",
    scopes: [],
  };

  return mcp.fetch(request, { authInfo });
});
