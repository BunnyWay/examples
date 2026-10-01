import "server-only";
import { createHash } from "node:crypto";
import type { VideoStatus } from "./video-status";

// Long enough for a slow upload to finish. Bunny checks the expiry on every TUS request.
const SIGNATURE_TTL_SECONDS = 24 * 60 * 60;

export type UploadCredentials = {
  videoId: string;
  libraryId: string;
  expirationTime: number;
  signature: string;
};

export function isConfigured(): boolean {
  return Boolean(process.env.BUNNY_STREAM_LIBRARY_ID && process.env.BUNNY_STREAM_API_KEY);
}

function config() {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const apiKey = process.env.BUNNY_STREAM_API_KEY;
  if (!libraryId || !apiKey) {
    throw new Error("Set BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_API_KEY in .env.local");
  }

  return { libraryId, apiKey };
}

async function stream<T>(path: string, init?: RequestInit): Promise<T> {
  const { libraryId, apiKey } = config();
  const response = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos${path}`, {
    ...init,
    headers: { AccessKey: apiKey, Accept: "application/json", "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Bunny Stream returned ${response.status}: ${await response.text()}`);
  }

  return response.json() as Promise<T>;
}

export async function getVideo(videoId: string): Promise<VideoStatus> {
  const { libraryId } = config();
  const video = await stream<{ status: number; encodeProgress: number }>(`/${encodeURIComponent(videoId)}`);

  return {
    status: video.status,
    encodeProgress: video.encodeProgress,
    embedUrl: `https://player.mediadelivery.net/embed/${libraryId}/${videoId}`,
  };
}

export async function createVideo(title: string): Promise<string> {
  const video = await stream<{ guid: string }>("", { method: "POST", body: JSON.stringify({ title }) });

  return video.guid;
}

export function signUpload(videoId: string): UploadCredentials {
  const { libraryId, apiKey } = config();
  const expirationTime = Math.floor(Date.now() / 1000) + SIGNATURE_TTL_SECONDS;
  const signature = createHash("sha256")
    .update(`${libraryId}${apiKey}${expirationTime}${videoId}`)
    .digest("hex");

  return { videoId, libraryId, expirationTime, signature };
}
