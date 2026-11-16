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
  title: string;
  description: string | null;
  length: number;
  dateUploaded: string;
  thumbnailFileName: string | null;
  availableResolutions: string | null;
};

type VideoPage = {
  totalItems: number;
  items: Video[];
};

const WATCH_URL = "https://example.com/watch";
const SITEMAP_PATH = "sitemap-videos.xml";
const PAGE_SIZE = 100;

async function listVideos(libraryId: number): Promise<Video[]> {
  const videos: Video[] = [];

  for (let page = 1; ; page++) {
    const res = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos?page=${page}&itemsPerPage=${PAGE_SIZE}&orderBy=date`,
      { headers: { AccessKey: process.env.STREAM_API_KEY! } },
    );

    // A 5xx tells Stream to retry the delivery later.
    if (!res.ok) throw new Error(`List Videos failed with ${res.status}`);

    const { items, totalItems }: VideoPage = await res.json();
    videos.push(...items);

    if (items.length === 0 || videos.length >= totalItems) return videos;
  }
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toSitemap(libraryId: number, videos: Video[]) {
  const urls = videos.map(
    (video) => `  <url>
    <loc>${WATCH_URL}/${video.guid}</loc>
    <video:video>
      <video:thumbnail_loc>https://${process.env.STREAM_CDN_HOSTNAME}/${video.guid}/${video.thumbnailFileName}</video:thumbnail_loc>
      <video:title>${escapeXml(video.title)}</video:title>
      <video:description>${escapeXml(video.description || video.title)}</video:description>
      <video:player_loc>https://player.mediadelivery.net/embed/${libraryId}/${video.guid}</video:player_loc>
      <video:duration>${Math.round(video.length)}</video:duration>
      <video:publication_date>${video.dateUploaded}</video:publication_date>
    </video:video>
  </url>`,
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.join("\n")}
</urlset>
`;
}

async function handle(event: StreamEvent): Promise<Response> {
  if (event.Status !== 3 && event.Status !== 32) return new Response("Ignored");

  // Only videos that can play belong in the sitemap. A deleted video is already missing from the list.
  const videos = (await listVideos(event.VideoLibraryId)).filter(
    (video) => video.availableResolutions && video.thumbnailFileName,
  );

  const res = await fetch(
    `https://${process.env.STORAGE_HOSTNAME}/${process.env.STORAGE_ZONE_NAME}/${SITEMAP_PATH}`,
    {
      method: "PUT",
      headers: {
        AccessKey: process.env.STORAGE_ZONE_PASSWORD!,
        "Content-Type": "application/xml",
      },
      body: toSitemap(event.VideoLibraryId, videos),
    },
  );
  if (!res.ok) throw new Error(`Storage upload failed with ${res.status}`);

  // TODO: purge the sitemap's URL on your pull zone if it's cached,
  //       and reference it from robots.txt or your sitemap index.
  console.log(`Wrote ${videos.length} videos to ${SITEMAP_PATH}`);

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
