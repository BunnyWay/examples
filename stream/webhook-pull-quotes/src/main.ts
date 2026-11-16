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

const WATCH_URL = "https://example.com/watch";

function toSeconds(time: string) {
  const [h = 0, m = 0, s = 0] = time.split(":").map(Number);

  return h * 3600 + m * 60 + Math.floor(s);
}

// Keeps each cue's start time so the model can point back into the video.
function toTimedLines(vtt: string) {
  return vtt.split("\n\n").flatMap((cue) => {
    const [timing, ...text] = cue.split("\n").filter((l) => !/^\d+$/.test(l));
    if (!timing?.includes("-->")) return [];

    const start = timing.split(" --> ")[0] ?? "0:0:0";

    return [`[${toSeconds(start)}] ${text.join(" ")}`];
  });
}

async function handle(event: StreamEvent): Promise<Response> {
  if (event.Status !== 9) return new Response("Ignored");

  // Assumes English captions. See webhook-searchable-transcripts for reading every track.
  const res = await fetch(
    `https://${process.env.STREAM_CDN_HOSTNAME}/${event.VideoGuid}/captions/en.vtt`,
  );
  if (!res.ok) throw new Error(`Captions returned ${res.status}`);

  const lines = toTimedLines(await res.text());

  // TODO: send `lines.join("\n")` to your model (OpenAI, Anthropic, a self-hosted one)
  //       and ask for the three most quotable lines as JSON: [{ "quote": "...", "start": 83 }].
  const quotes = [{ quote: "Example quote", start: 83 }];
  console.log(`${lines.length} caption lines to choose from`);

  for (const { quote, start } of quotes) {
    const link = `${WATCH_URL}/${event.VideoGuid}?t=${start}`;
    // TODO: save as a draft post in your scheduler, or render a share card.
    console.log(`"${quote}" ${link}`);
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
