import { createHash } from "node:crypto";
import { BUNNY_STREAM_LIBRARY_ID, BUNNY_STREAM_TOKEN_AUTH_KEY } from "$app/env/private";

// How long a signed embed link stays valid. Keep it short so a copied link
// soon stops working. Every page load signs a fresh one.
const TOKEN_TTL_SECONDS = 60 * 60;

export type SignedEmbed = {
	url: string;
	/** Unix time in seconds when Bunny stops accepting the link. */
	expires: number;
};

export function isConfigured(): boolean {
	return Boolean(BUNNY_STREAM_LIBRARY_ID && BUNNY_STREAM_TOKEN_AUTH_KEY);
}

function config() {
	const libraryId = BUNNY_STREAM_LIBRARY_ID;
	const tokenKey = BUNNY_STREAM_TOKEN_AUTH_KEY;
	if (!libraryId || !tokenKey) {
		throw new Error("Set BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_TOKEN_AUTH_KEY in .env");
	}

	return { libraryId, tokenKey };
}

export function signEmbedUrl(videoId: string): SignedEmbed {
	const { libraryId, tokenKey } = config();
	const expires = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
	// Bunny hashes the key, video ID, and expiry joined with no separator.
	const token = createHash("sha256").update(`${tokenKey}${videoId}${expires}`).digest("hex");
	const query = new URLSearchParams({ token, expires: String(expires) });

	return { url: `https://player.mediadelivery.net/embed/${libraryId}/${videoId}?${query}`, expires };
}
