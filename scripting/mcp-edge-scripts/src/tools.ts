import { type CallToolResult, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod";
import type {
  components,
  createComputeClient,
} from "@bunny.net/openapi-client/compute";
import { missingEnv } from "./env.ts";

type ComputeClient = ReturnType<typeof createComputeClient>;
type EdgeScript = components["schemas"]["EdgeScriptModel"];

const SCRIPT_TYPES = { standalone: 1, middleware: 2 } as const;

const scriptId = z.number().int().describe("The Edge Script ID");
const scriptType = z
  .enum(["standalone", "middleware"])
  .describe(
    "standalone answers requests itself, middleware sits in front of a pull zone origin",
  );
const envInputs = {
  variables: z
    .record(z.string().min(1).max(256), z.string())
    .optional()
    .describe("Environment variables to set before publishing, by name"),
  secrets: z
    .record(z.string().min(1).max(256), z.string())
    .optional()
    .describe(
      "Secrets to set before publishing, by name. They're stored encrypted and can't be read back.",
    ),
  ignoreEnv: z
    .array(z.string())
    .optional()
    .describe(
      "Env names the code reads that don't need a value, such as ones a bundled library checks. Only pass names the user has confirmed.",
    ),
};

type EnvValues = Record<string, string> | undefined;

// The deployment key can publish code to the script, so it never goes to the model.
function withoutDeploymentKey(
  script: EdgeScript | undefined,
): Omit<EdgeScript, "DeploymentKey"> | undefined {
  if (!script) {
    return undefined;
  }

  const { DeploymentKey: _, ...rest } = script;

  return rest;
}

async function call(run: () => Promise<unknown>): Promise<CallToolResult> {
  try {
    const result = await run();

    return {
      content: [
        { type: "text", text: JSON.stringify(result ?? { ok: true }, null, 2) },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return { isError: true, content: [{ type: "text", text: message }] };
  }
}

export function createMcpServer(bunny: ComputeClient): McpServer {
  const server = new McpServer({
    name: "bunny-edge-scripts",
    version: "1.0.0",
  });

  async function publish(id: number, note: string | undefined): Promise<void> {
    await bunny.POST("/compute/script/{id}/publish", {
      // The generated types list a uuid here by mistake. It belongs to
      // /publish/{uuid}, and this URL has no placeholder for it.
      params: { path: { id, uuid: null } },
      body: { Note: note },
    });
  }

  async function setEnv(
    id: number,
    variables: EnvValues,
    secrets: EnvValues,
  ): Promise<void> {
    for (const [name, value] of Object.entries(variables ?? {})) {
      await bunny.PUT("/compute/script/{id}/variables", {
        params: { path: { id } },
        body: { Name: name, DefaultValue: value },
      });
    }
    for (const [name, value] of Object.entries(secrets ?? {})) {
      await bunny.PUT("/compute/script/{id}/secrets", {
        params: { path: { id } },
        body: { Name: name, Secret: value },
      });
    }
  }

  async function envNamesOn(id: number): Promise<string[]> {
    const path = { params: { path: { id } } };
    const [script, secrets] = await Promise.all([
      bunny.GET("/compute/script/{id}", path),
      bunny.GET("/compute/script/{id}/secrets", path),
    ]);

    return [
      ...(script.data?.EdgeScriptVariables ?? []),
      ...(secrets.data?.Secrets ?? []),
    ].flatMap((entry) => (entry.Name ? [entry.Name] : []));
  }

  server.registerTool(
    "list_scripts",
    {
      description: "List the Edge Scripts on the bunny.net account",
      inputSchema: z.object({
        search: z
          .string()
          .optional()
          .describe("Only return scripts whose name matches"),
        page: z.number().int().min(1).optional(),
      }),
      annotations: { readOnlyHint: true },
    },
    ({ search, page }) =>
      call(async () => {
        const { data } = await bunny.GET("/compute/script", {
          params: { query: { search, page, includeLinkedPullzones: true } },
        });

        return {
          ...data,
          Items: data?.Items?.map(withoutDeploymentKey),
        };
      }),
  );

  server.registerTool(
    "get_script",
    {
      description:
        "Get everything about an Edge Script: its details, hostnames, linked pull zones, saved code, environment variables, secret names, and recent releases. MissingEnv lists env names the code reads that have no variable or secret.",
      inputSchema: z.object({ id: scriptId }),
      annotations: { readOnlyHint: true },
    },
    ({ id }) =>
      call(async () => {
        const path = { params: { path: { id } } };
        const [script, code, secrets, releases] = await Promise.all([
          bunny.GET("/compute/script/{id}", path),
          bunny.GET("/compute/script/{id}/code", path),
          bunny.GET("/compute/script/{id}/secrets", path),
          bunny.GET("/compute/script/{id}/releases", {
            params: { path: { id }, query: { perPage: 5 } },
          }),
        ]);

        const envNames = [
          ...(script.data?.EdgeScriptVariables ?? []),
          ...(secrets.data?.Secrets ?? []),
        ].flatMap((entry) => (entry.Name ? [entry.Name] : []));

        return {
          ...withoutDeploymentKey(script.data),
          Code: code.data?.Code,
          SecretNames: secrets.data?.Secrets?.map((secret) => secret.Name),
          MissingEnv: missingEnv(code.data?.Code ?? "", envNames),
          RecentReleases: releases.data?.Items?.map(
            ({ Code: _, ...release }) => release,
          ),
        };
      }),
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
        dateTo: z
          .string()
          .optional()
          .describe("ISO 8601 date, defaults to now"),
        hourly: z.boolean().optional(),
      }),
      annotations: { readOnlyHint: true },
    },
    ({ id, dateFrom, dateTo, hourly }) =>
      call(async () => {
        const { data } = await bunny.GET("/compute/script/{id}/statistics", {
          params: { path: { id }, query: { dateFrom, dateTo, hourly } },
        });

        return data;
      }),
  );

  server.registerTool(
    "create_script",
    {
      description:
        "Create an Edge Script. By default a pull zone is created with it so the script gets a public URL. The code is saved but not live until it's published. Pass the env values the code reads as variables or secrets. If any are missing, the script is created but not published, and missingEnv lists them so you can ask the user for values.",
      inputSchema: z.object({
        name: z.string().max(100),
        type: scriptType.default("standalone"),
        code: z
          .string()
          .optional()
          .describe("TypeScript or JavaScript source for the script"),
        publish: z
          .boolean()
          .default(false)
          .describe("Publish the code as the first release"),
        createLinkedPullZone: z.boolean().default(true),
        linkedPullZoneName: z.string().optional(),
        ...envInputs,
      }),
    },
    ({
      name,
      type,
      code,
      publish: shouldPublish,
      createLinkedPullZone,
      linkedPullZoneName,
      variables,
      secrets,
      ignoreEnv,
    }) =>
      call(async () => {
        const { data } = await bunny.POST("/compute/script", {
          body: {
            Name: name,
            ScriptType: SCRIPT_TYPES[type],
            Code: code,
            CreateLinkedPullZone: createLinkedPullZone,
            LinkedPullZoneName: linkedPullZoneName,
          },
        });

        const id = data?.Id;
        if (id === undefined) {
          throw new Error("bunny.net didn't return an ID for the new script");
        }

        await setEnv(id, variables, secrets);

        const missing = missingEnv(
          code ?? "",
          [...Object.keys(variables ?? {}), ...Object.keys(secrets ?? {})],
          ignoreEnv,
        );
        const published = shouldPublish && missing.length === 0;
        if (published) {
          await publish(id, undefined);
        }

        return {
          ...withoutDeploymentKey(data),
          published,
          ...(missing.length > 0 && {
            missingEnv: missing,
            next: "The code reads these env names, but no value was given. Ask the user for each value and whether it's a secret, then call update_script with variables or secrets and publish: true.",
          }),
        };
      }),
  );

  server.registerTool(
    "update_script",
    {
      description:
        "Update an Edge Script: rename it, change its type, save new code, set env values, and publish. Saved code isn't live until it's published. Set only publish to republish the code that's already saved. Publishing is skipped while the code reads env names that have no value, and missingEnv lists them.",
      inputSchema: z.object({
        id: scriptId,
        name: z.string().max(100).optional(),
        type: scriptType.optional(),
        code: z.string().optional().describe("New source to save"),
        publish: z
          .boolean()
          .default(false)
          .describe("Publish the saved code as a new release"),
        note: z.string().optional().describe("A note for the release"),
        ...envInputs,
      }),
    },
    ({
      id,
      name,
      type,
      code,
      publish: shouldPublish,
      note,
      variables,
      secrets,
      ignoreEnv,
    }) =>
      call(async () => {
        const changed: string[] = [];

        if (name !== undefined || type !== undefined) {
          await bunny.POST("/compute/script/{id}", {
            params: { path: { id } },
            body: {
              Name: name,
              ScriptType: type ? SCRIPT_TYPES[type] : undefined,
            },
          });
          changed.push("details");
        }

        if (code !== undefined) {
          await bunny.POST("/compute/script/{id}/code", {
            params: { path: { id } },
            body: { Code: code },
          });
          changed.push("code");
        }

        await setEnv(id, variables, secrets);
        if (variables || secrets) {
          changed.push("env");
        }

        if (!shouldPublish) {
          if (changed.length === 0) {
            throw new Error(
              "Nothing to update. Pass name, type, code, variables, secrets, or publish.",
            );
          }

          return { id, changed, published: false };
        }

        const savedCode =
          code ??
          (
            await bunny.GET("/compute/script/{id}/code", {
              params: { path: { id } },
            })
          ).data?.Code ??
          "";
        const missing = missingEnv(savedCode, await envNamesOn(id), ignoreEnv);
        if (missing.length > 0) {
          return {
            id,
            changed,
            published: false,
            missingEnv: missing,
            next: "The code reads these env names, but the script has no value for them. Ask the user for each value and whether it's a secret, then call update_script again with variables or secrets and publish: true.",
          };
        }

        await publish(id, note);
        changed.push("published");

        return { id, changed, published: true };
      }),
  );

  server.registerTool(
    "set_env",
    {
      description:
        "Create or update an environment variable on an Edge Script. Set secret to store it encrypted instead, where the value can't be read back.",
      inputSchema: z.object({
        id: scriptId,
        name: z.string().min(1).max(256),
        value: z.string(),
        secret: z.boolean().default(false),
      }),
      annotations: { idempotentHint: true },
    },
    ({ id, name, value, secret }) =>
      call(async () => {
        if (secret) {
          await bunny.PUT("/compute/script/{id}/secrets", {
            params: { path: { id } },
            body: { Name: name, Secret: value },
          });
        } else {
          await bunny.PUT("/compute/script/{id}/variables", {
            params: { path: { id } },
            body: { Name: name, DefaultValue: value },
          });
        }

        return { id, name, secret };
      }),
  );

  server.registerTool(
    "delete_env",
    {
      description:
        "Delete an environment variable or secret from an Edge Script by name",
      inputSchema: z.object({ id: scriptId, name: z.string().min(1) }),
      annotations: { destructiveHint: true },
    },
    ({ id, name }) =>
      call(async () => {
        const path = { params: { path: { id } } };
        const [script, secrets] = await Promise.all([
          bunny.GET("/compute/script/{id}", path),
          bunny.GET("/compute/script/{id}/secrets", path),
        ]);
        const variable = script.data?.EdgeScriptVariables?.find(
          (entry) => entry.Name === name,
        );
        const secret = secrets.data?.Secrets?.find(
          (entry) => entry.Name === name,
        );
        const deleted: string[] = [];

        if (variable?.Id !== undefined) {
          await bunny.DELETE("/compute/script/{id}/variables/{variableId}", {
            params: { path: { id, variableId: variable.Id } },
          });
          deleted.push("variable");
        }

        if (secret?.Id !== undefined) {
          await bunny.DELETE("/compute/script/{id}/secrets/{secretId}", {
            params: { path: { id, secretId: secret.Id } },
          });
          deleted.push("secret");
        }

        if (deleted.length === 0) {
          throw new Error(
            `No variable or secret named ${name} on script ${id}`,
          );
        }

        return { id, name, deleted };
      }),
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
      call(async () => {
        await bunny.DELETE("/compute/script/{id}", {
          params: { path: { id }, query: { deleteLinkedPullZones } },
        });

        return { id, deleted: true };
      }),
  );

  return server;
}
