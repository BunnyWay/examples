import * as BunnySDK from "@bunny.net/edgescript-sdk";
import { createComputeClient } from "@bunny.net/openapi-client/compute";
import { type AuthInfo, createMcpHandler } from "@modelcontextprotocol/server";
import { createMcpServer } from "./tools.ts";

function getAccessKey(request: Request): string | null {
  const authorization = request.headers.get("Authorization");
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

  return bearer || request.headers.get("AccessKey")?.trim() || null;
}

const mcp = createMcpHandler(({ authInfo }) => {
  if (!authInfo) {
    throw new Error("createMcpHandler was called without authInfo");
  }

  return createMcpServer(
    createComputeClient({
      apiKey: authInfo.token,
      userAgent: "bunny-edge-scripts-mcp",
    }),
  );
});

function unauthorized(): Response {
  return Response.json(
    {
      error: "invalid_token",
      error_description:
        "Send your bunny.net API key as `Authorization: Bearer <key>`",
    },
    { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="bunny.net"' } },
  );
}

BunnySDK.net.http.serve((request) => {
  const { pathname } = new URL(request.url);

  if (pathname === "/mcp") {
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
  }

  if (pathname === "/") {
    return new Response(
      "bunny.net Edge Scripts MCP server. Connect your MCP client to /mcp.\n",
    );
  }

  return new Response("Not found", { status: 404 });
});
