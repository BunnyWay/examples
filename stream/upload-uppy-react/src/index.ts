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

async function getVideoStatus(videoId: string): Promise<number> {
  const video = (await (await stream(`/${encodeURIComponent(videoId)}`)).json()) as { status: number };

  return video.status;
}

async function createVideo(title: string): Promise<string> {
  // TUS needs an existing video object to upload into.
  const video = (await (await stream("", { method: "POST", body: JSON.stringify({ title }) })).json()) as {
    guid: string;
  };

  return video.guid;
}

function signUpload(videoId: string): UploadCredentials {
  const expirationTime = Math.floor(Date.now() / 1000) + SIGNATURE_TTL_SECONDS;
  const signature = new Bun.CryptoHasher("sha256")
    .update(`${libraryId}${apiKey}${expirationTime}${videoId}`)
    .digest("hex");

  return { videoId, libraryId, expirationTime, signature };
}

// Only re-sign videos that are still waiting for their file (status 0, Created).
async function canResume(videoId: string): Promise<boolean> {
  try {
    return (await getVideoStatus(videoId)) === 0;
  } catch {
    return false;
  }
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
        // Require a signed-in user here. This route is public, and it creates videos in your library.
        const { title, videoId } = (await req.json()) as { title?: unknown; videoId?: unknown };
        if (typeof title !== "string" || !title.trim()) {
          return Response.json({ error: "title is required" }, { status: 400 });
        }

        try {
          // Pass the videoId of an unfinished upload to re-sign it, so Uppy can resume.
          if (typeof videoId === "string" && (await canResume(videoId))) {
            return Response.json(signUpload(videoId));
          }

          return Response.json(signUpload(await createVideo(title)));
        } catch (error) {
          return errorResponse(error);
        }
      },
    },

    "/api/videos/:id": {
      async GET(req) {
        // Require a signed-in user here, and check they own this video ID. This route is public.
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
