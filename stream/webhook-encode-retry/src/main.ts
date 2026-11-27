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

async function postToSlack(text: string) {
  const res = await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error(`Slack returned ${res.status}`);
}

async function handle(event: StreamEvent): Promise<Response> {
  if (event.Status !== 5) return new Response("Ignored");

  // TODO: check your database for an earlier failure of event.VideoGuid,
  //       and record this one.
  const failedBefore = false;

  if (!failedBefore) {
    const res = await fetch(
      `https://video.bunnycdn.com/library/${event.VideoLibraryId}/videos/${event.VideoGuid}/reencode`,
      { method: "POST", headers: { AccessKey: process.env.STREAM_API_KEY! } },
    );
    if (res.ok) return new Response("Retrying");

    // Failed URL fetches and rejected non-video files have no original, so the
    // re-encode is refused and no second status 5 will arrive. Alert now instead.
    await postToSlack(`Encoding failed for ${event.VideoGuid} and can't be retried (${res.status})`);

    return new Response("OK");
  }

  await postToSlack(`Encoding failed twice for ${event.VideoGuid}`);

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
