import { type CallToolResult, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod";
import type { createComputeClient } from "@bunny.net/openapi-client/compute";

type ComputeClient = ReturnType<typeof createComputeClient>;

const SCRIPT_TYPES = { standalone: 1, middleware: 2 } as const;

const scriptId = z.number().int().describe("The Edge Script ID");
const scriptType = z
  .enum(["standalone", "middleware"])
  .describe(
    "standalone answers requests itself, middleware sits in front of a pull zone origin",
  );
const page = z.number().int().min(1).optional();
const perPage = z.number().int().min(5).max(1000).optional();

async function call(
  request: () => Promise<{ data?: unknown }>,
): Promise<CallToolResult> {
  try {
    const { data } = await request();

    return {
      content: [
        { type: "text", text: JSON.stringify(data ?? { ok: true }, null, 2) },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return { isError: true, content: [{ type: "text", text: message }] };
  }
}

export function createMcpServer(bunny: ComputeClient): McpServer {
  const server = new McpServer({ name: "bunny-edge-scripts", version: "1.0.0" });

  server.registerTool(
    "list_scripts",
    {
      description: "List the Edge Scripts on the bunny.net account",
      inputSchema: z.object({
        search: z
          .string()
          .optional()
          .describe("Only return scripts whose name matches"),
        page,
        perPage,
      }),
      annotations: { readOnlyHint: true },
    },
    ({ search, page, perPage }) =>
      call(() =>
        bunny.GET("/compute/script", {
          params: {
            query: { search, page, perPage, includeLinkedPullzones: true },
          },
        })
      ),
  );

  server.registerTool(
    "get_script",
    {
      description:
        "Get an Edge Script's details, including its linked pull zones, hostnames, and environment variables",
      inputSchema: z.object({ id: scriptId }),
      annotations: { readOnlyHint: true },
    },
    ({ id }) => call(() => bunny.GET("/compute/script/{id}", { params: { path: { id } } })),
  );

  server.registerTool(
    "create_script",
    {
      description:
        "Create an Edge Script. By default a pull zone is created with it so the script gets a public URL. Call publish_script afterwards to make the code live.",
      inputSchema: z.object({
        name: z.string().max(100),
        type: scriptType.default("standalone"),
        code: z
          .string()
          .optional()
          .describe("TypeScript or JavaScript source for the script"),
        createLinkedPullZone: z.boolean().default(true),
        linkedPullZoneName: z.string().optional(),
      }),
    },
    ({ name, type, code, createLinkedPullZone, linkedPullZoneName }) =>
      call(() =>
        bunny.POST("/compute/script", {
          body: {
            Name: name,
            ScriptType: SCRIPT_TYPES[type],
            Code: code,
            CreateLinkedPullZone: createLinkedPullZone,
            LinkedPullZoneName: linkedPullZoneName,
          },
        })
      ),
  );

  server.registerTool(
    "update_script",
    {
      description: "Rename an Edge Script or change its type",
      inputSchema: z.object({
        id: scriptId,
        name: z.string().max(100).optional(),
        type: scriptType.optional(),
      }),
      annotations: { idempotentHint: true },
    },
    ({ id, name, type }) =>
      call(() =>
        bunny.POST("/compute/script/{id}", {
          params: { path: { id } },
          body: {
            Name: name,
            ScriptType: type ? SCRIPT_TYPES[type] : undefined,
          },
        })
      ),
  );

  server.registerTool(
    "delete_script",
    {
      description:
        "Delete an Edge Script, and optionally the pull zones linked to it",
      inputSchema: z.object({
        id: scriptId,
        deleteLinkedPullZones: z.boolean().default(false),
      }),
      annotations: { destructiveHint: true },
    },
    ({ id, deleteLinkedPullZones }) =>
      call(() =>
        bunny.DELETE("/compute/script/{id}", {
          params: { path: { id }, query: { deleteLinkedPullZones } },
        })
      ),
  );

  server.registerTool(
    "get_script_code",
    {
      description:
        "Get the current code of an Edge Script. This is the saved code, which may not be published yet.",
      inputSchema: z.object({ id: scriptId }),
      annotations: { readOnlyHint: true },
    },
    ({ id }) => call(() => bunny.GET("/compute/script/{id}/code", { params: { path: { id } } })),
  );

  server.registerTool(
    "set_script_code",
    {
      description:
        "Save new code for an Edge Script. Nothing changes for visitors until publish_script runs.",
      inputSchema: z.object({ id: scriptId, code: z.string() }),
      annotations: { idempotentHint: true },
    },
    ({ id, code }) =>
      call(() => bunny.POST("/compute/script/{id}/code", {
          params: { path: { id } },
          body: { Code: code },
        })),
  );

  server.registerTool(
    "publish_script",
    {
      description:
        "Publish the saved code of an Edge Script as a new release, making it live",
      inputSchema: z.object({
        id: scriptId,
        note: z.string().optional().describe("A note to attach to the release"),
      }),
    },
    ({ id, note }) =>
      call(() =>
        bunny.POST("/compute/script/{id}/publish", {
          // The generated types list a uuid here by mistake. It belongs to
          // /publish/{uuid}, and this URL has no placeholder for it.
          params: { path: { id, uuid: null } },
          body: { Note: note },
        })
      ),
  );

  server.registerTool(
    "list_releases",
    {
      description: "List the published releases of an Edge Script, newest first",
      inputSchema: z.object({ id: scriptId, page, perPage }),
      annotations: { readOnlyHint: true },
    },
    ({ id, page, perPage }) =>
      call(() => bunny.GET("/compute/script/{id}/releases", {
          params: { path: { id }, query: { page, perPage } },
        })),
  );

  server.registerTool(
    "get_statistics",
    {
      description: "Get request and CPU time statistics for an Edge Script",
      inputSchema: z.object({
        id: scriptId,
        dateFrom: z
          .string()
          .optional()
          .describe("ISO 8601 date, defaults to 30 days ago"),
        dateTo: z.string().optional().describe("ISO 8601 date, defaults to now"),
        hourly: z.boolean().optional(),
      }),
      annotations: { readOnlyHint: true },
    },
    ({ id, dateFrom, dateTo, hourly }) =>
      call(() =>
        bunny.GET("/compute/script/{id}/statistics", {
          params: { path: { id }, query: { dateFrom, dateTo, hourly } },
        })
      ),
  );

  server.registerTool(
    "set_variable",
    {
      description:
        "Create or update an environment variable on an Edge Script",
      inputSchema: z.object({
        id: scriptId,
        name: z.string().min(1).max(256),
        defaultValue: z.string().max(256).optional(),
        required: z.boolean().optional(),
      }),
      annotations: { idempotentHint: true },
    },
    ({ id, name, defaultValue, required }) =>
      call(() =>
        bunny.PUT("/compute/script/{id}/variables", {
          params: { path: { id } },
          body: { Name: name, DefaultValue: defaultValue, Required: required },
        })
      ),
  );

  server.registerTool(
    "delete_variable",
    {
      description:
        "Delete an environment variable from an Edge Script. Variable IDs are listed by get_script.",
      inputSchema: z.object({ id: scriptId, variableId: z.number().int() }),
      annotations: { destructiveHint: true },
    },
    ({ id, variableId }) =>
      call(() =>
        bunny.DELETE("/compute/script/{id}/variables/{variableId}", {
          params: { path: { id, variableId } },
        })
      ),
  );

  server.registerTool(
    "list_secrets",
    {
      description:
        "List the secrets on an Edge Script. Only names are returned, never values.",
      inputSchema: z.object({ id: scriptId }),
      annotations: { readOnlyHint: true },
    },
    ({ id }) => call(() => bunny.GET("/compute/script/{id}/secrets", { params: { path: { id } } })),
  );

  server.registerTool(
    "set_secret",
    {
      description: "Create or update a secret on an Edge Script",
      inputSchema: z.object({
        id: scriptId,
        name: z.string().min(1),
        secret: z.string(),
      }),
      annotations: { idempotentHint: true },
    },
    ({ id, name, secret }) =>
      call(() =>
        bunny.PUT("/compute/script/{id}/secrets", {
          params: { path: { id } },
          body: { Name: name, Secret: secret },
        })
      ),
  );

  server.registerTool(
    "delete_secret",
    {
      description:
        "Delete a secret from an Edge Script. Secret IDs are listed by list_secrets.",
      inputSchema: z.object({ id: scriptId, secretId: z.number().int() }),
      annotations: { destructiveHint: true },
    },
    ({ id, secretId }) =>
      call(() => bunny.DELETE("/compute/script/{id}/secrets/{secretId}", {
          params: { path: { id, secretId } },
        })),
  );

  return server;
}
