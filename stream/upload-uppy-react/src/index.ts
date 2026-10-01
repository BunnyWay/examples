import { serve } from "bun";
import index from "./index.html";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }

  return value;
}

const libraryId = requireEnv("BUNNY_STREAM_LIBRARY_ID");
const apiKey = requireEnv("BUNNY_STREAM_API_KEY");
const videosUrl = `https://video.bunnycdn.com/library/${libraryId}/videos`;

// Long enough for a slow upload to finish. Bunny checks the expiry on every TUS request.
const SIGNATURE_TTL_SECONDS = 24 * 60 * 60;

export type UploadCredentials = {
  videoId: string;
  libraryId: string;
  expirationTime: number;
  signature: string;
};

export type VideoStatus = {
  status: number;
  encodeProgress: number;
  embedUrl: string;
};

async function stream(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${videosUrl}${path}`, {
    ...init,
    headers: { AccessKey: apiKey, Accept: "application/json", "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Bunny Stream returned ${response.status}: ${await response.text()}`);
  }

  return response;
}

async function createUpload(title: string): Promise<UploadCredentials> {
  // TUS needs an existing video object to upload into.
  const video = (await (await stream("", { method: "POST", body: JSON.stringify({ title }) })).json()) as {
    guid: string;
  };
  const expirationTime = Math.floor(Date.now() / 1000) + SIGNATURE_TTL_SECONDS;
  const signature = new Bun.CryptoHasher("sha256")
    .update(`${libraryId}${apiKey}${expirationTime}${video.guid}`)
    .digest("hex");

  return { videoId: video.guid, libraryId, expirationTime, signature };
}

function errorResponse(error: unknown): Response {
  const message = error instanceof Error ? error.message : "Unknown error";

  return Response.json({ error: message }, { status: 502 });
}

const server = serve({
  routes: {
    "/*": index,

    "/api/uploads": {
      async POST(req) {
        const { title } = (await req.json()) as { title?: unknown };
        if (typeof title !== "string" || !title.trim()) {
          return Response.json({ error: "title is required" }, { status: 400 });
        }

        try {
          return Response.json(await createUpload(title));
        } catch (error) {
          return errorResponse(error);
        }
      },
    },

    "/api/videos/:id": {
      async GET(req) {
        try {
          const id = encodeURIComponent(req.params.id);
          const video = (await (await stream(`/${id}`)).json()) as { status: number; encodeProgress: number };

          return Response.json({
            status: video.status,
            encodeProgress: video.encodeProgress,
            embedUrl: `https://player.mediadelivery.net/embed/${libraryId}/${id}`,
          } satisfies VideoStatus);
        } catch (error) {
          return errorResponse(error);
        }
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`Server running at ${server.url}`);
