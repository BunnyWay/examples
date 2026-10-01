import "server-only";
import { createHash } from "node:crypto";

// How long a signed embed URL stays valid. After that Bunny answers it with a 403,
// so a copied link stops working. Bunny suggests 1 to 5 minutes; an hour is easier to try out.
const TOKEN_TTL_SECONDS = 60 * 60;

export type SignedEmbed = {
  src: string;
  expires: number;
};

export function isConfigured(): boolean {
  return Boolean(
    process.env.BUNNY_STREAM_LIBRARY_ID &&
      process.env.BUNNY_STREAM_VIDEO_ID &&
      process.env.BUNNY_STREAM_TOKEN_AUTH_KEY,
  );
}

export function signEmbedUrl(): SignedEmbed {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const videoId = process.env.BUNNY_STREAM_VIDEO_ID;
  const key = process.env.BUNNY_STREAM_TOKEN_AUTH_KEY;
  if (!libraryId || !videoId || !key) {
    throw new Error(
      "Set BUNNY_STREAM_LIBRARY_ID, BUNNY_STREAM_VIDEO_ID, and BUNNY_STREAM_TOKEN_AUTH_KEY in .env.local",
    );
  }

  const expires = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  // SHA256_HEX(key + video ID + expiry), with no separators.
  const token = createHash("sha256").update(`${key}${videoId}${expires}`).digest("hex");
  const query = new URLSearchParams({ token, expires: String(expires) });

  return {
    src: `https://player.mediadelivery.net/embed/${libraryId}/${videoId}?${query}`,
    expires,
  };
}
