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
  width: number;
  height: number;
  length: number;
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

async function handle(event: StreamEvent): Promise<Response> {
  if (event.Status !== 3) return new Response("Ignored");

  const video = await getVideo(event);
  const feed = video.height > video.width && video.length <= 60 ? "shorts" : "main";

  // TODO: save the feed against the video in your database.
  console.log(`${event.VideoGuid} goes in the ${feed} feed`);

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
