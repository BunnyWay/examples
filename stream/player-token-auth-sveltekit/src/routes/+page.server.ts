import { env } from "$env/dynamic/private";
import { isConfigured, signEmbedUrl } from "$lib/server/bunny-stream";
import type { PageServerLoad } from "./$types";

// Runs on the server for every request, so the token key never reaches the browser.
// Only the signed URL does. In your app, pick the video ID after your own access check.
export const load: PageServerLoad = () => {
	const videoId = env.BUNNY_STREAM_VIDEO_ID;
	if (!videoId || !isConfigured()) {
		return { embed: null };
	}

	return { embed: signEmbedUrl(videoId) };
};
