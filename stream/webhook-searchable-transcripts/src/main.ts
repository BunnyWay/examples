import * as BunnySDK from "@bunny.net/edgescript-sdk";
import process from "node:process";

type StreamEvent = {
  VideoLibraryId: number;
  VideoGuid: string;
  Status: number;
  EventId: string;
  Timestamp: string;
  Reason?: string;
};

type Video = {
  guid: string;
  captions: { srclang: string; version: number }[] | null;
};

async function getVideo(event: StreamEvent): Promise<Video> {
  const res = await fetch(
    `https://video.bunnycdn.com/library/${event.VideoLibraryId}/videos/${event.VideoGuid}`,
    { headers: { AccessKey: process.env.STREAM_API_KEY! } },
  );

  // A 5xx tells Stream to retry the delivery later.
  if (!res.ok) throw new Error(`Get Video failed with ${res.status}`);

  return res.json();
}

function toTranscript(vtt: string) {
  return vtt
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("WEBVTT") && !line.includes("-->") && !/^\d+$/.test(line))
    .join(" ");
}

async function handle(event: StreamEvent): Promise<Response> {
  if (event.Status !== 9) return new Response("Ignored");

  const video = await getVideo(event);

  for (const caption of video.captions ?? []) {
    const res = await fetch(
      `https://${process.env.STREAM_CDN_HOSTNAME}/${video.guid}/captions/${caption.srclang}.vtt?v=${caption.version}`,
    );
    if (!res.ok) throw new Error(`Caption ${caption.srclang} returned ${res.status}`);

    const transcript = toTranscript(await res.text());

    // TODO: save { videoId: video.guid, language: caption.srclang, transcript }
    //       to your database or search index (Bunny Database, Typesense, Meilisearch).
    console.log(`${caption.srclang}: ${transcript.length} characters`);
  }

  return new Response("OK");
}

// Stream signs the raw body with HMAC-SHA256, using the library's read-only API key.
async function isFromStream(req: Request, body: string) {
  const signature = req.headers.get("X-BunnyStream-Signature") ?? "";
  if (req.headers.get("X-BunnyStream-Signature-Version") !== "v1") return false;
  if (!/^[0-9a-f]{64}$/.test(signature)) return false;

  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.STREAM_READ_ONLY_KEY!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const bytes = Uint8Array.from(signature.match(/../g)!, (h) => parseInt(h, 16));

  return crypto.subtle.verify("HMAC", key, bytes, encoder.encode(body));
}

async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  // Verify the raw text before parsing, since re-serialising can change the bytes.
  const body = await req.text();

  if (!(await isFromStream(req, body))) {
    return new Response("Invalid signature", { status: 401 });
  }

  return handle(JSON.parse(body));
}

BunnySDK.net.http.serve(handler);
