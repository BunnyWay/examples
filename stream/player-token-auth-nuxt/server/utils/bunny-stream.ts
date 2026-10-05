import { createHash } from "node:crypto";

// How long a signed link plays for. Each page load signs a fresh one, so keep it short:
// a copied link stops working an hour later.
const EMBED_TOKEN_TTL_SECONDS = 60 * 60;

export type SignedEmbed = {
  url: string;
  /** Unix time in seconds when the link stops working. */
  expires: number;
};

export function signEmbedUrl(): SignedEmbed {
  const { bunnyStreamLibraryId, bunnyStreamVideoId, bunnyStreamTokenAuthKey } = useRuntimeConfig();
  if (!bunnyStreamLibraryId || !bunnyStreamVideoId || !bunnyStreamTokenAuthKey) {
    throw new Error(
      "Set NUXT_BUNNY_STREAM_LIBRARY_ID, NUXT_BUNNY_STREAM_VIDEO_ID, and NUXT_BUNNY_STREAM_TOKEN_AUTH_KEY in .env",
    );
  }

  // Nuxt parses NUXT_* values, so a numeric library ID arrives as a number.
  const libraryId = String(bunnyStreamLibraryId);
  const videoId = String(bunnyStreamVideoId);
  const expires = Math.floor(Date.now() / 1000) + EMBED_TOKEN_TTL_SECONDS;
  const token = createHash("sha256")
    .update(`${bunnyStreamTokenAuthKey}${videoId}${expires}`)
    .digest("hex");

  return {
    url: `https://player.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}`,
    expires,
  };
}
