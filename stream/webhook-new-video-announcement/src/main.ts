import * as BunnySDK from "@bunny.net/edgescript-sdk";
import process from "node:process";

type StreamEvent = {
  VideoLibraryId: number;
  VideoGuid: string;
  Status: number;
  EventId: string;
  Timestamp: string;
  Reason?: string;
  IsLiveStreamWebhook?: boolean;
};

type Video = {
  guid: string;
  title: string;
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

async function postToSlack(text: string) {
  const res = await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error(`Slack returned ${res.status}`);
}

const WATCH_URL = "https://example.com/watch";

async function handle(event: StreamEvent): Promise<Response> {
  if (event.Status !== 3) return new Response("Ignored");

  // TODO: check an "announced" flag for event.VideoGuid in your database.
  //       Status 3 repeats after a re-encode or for live recordings.
  const announced = false;
  if (announced) return new Response("Already announced");

  const video = await getVideo(event);

  await postToSlack(`New video: ${video.title} ${WATCH_URL}/${video.guid}`);

  // TODO: email your subscribers too (Resend, Postmark, your newsletter tool),
  //       then set the "announced" flag.

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
