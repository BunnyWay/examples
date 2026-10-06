import { BUNNY_STREAM_VIDEO_ID } from "$app/env/private";
import { isConfigured, signEmbedUrl } from "#lib/server/bunny-stream.ts";
import type { PageServerLoad } from "./$types";

// Runs on the server for every request, so the token key never reaches the browser.
// Only the signed URL does. In your app, pick the video ID after your own access check.
export const load: PageServerLoad = () => {
	if (!BUNNY_STREAM_VIDEO_ID || !isConfigured()) {
		return { embed: null };
	}

	// Check that the signed-in viewer may watch this video before signing. This runs for anyone who requests it.
	return { embed: signEmbedUrl(BUNNY_STREAM_VIDEO_ID) };
};
