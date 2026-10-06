import { json } from "@sveltejs/kit";
import { VideoStatusCode } from "#lib/bunny-stream.ts";
import { createVideo, getVideo, signUpload } from "#lib/server/bunny-stream.ts";
import type { RequestHandler } from "./$types";

// Only re-sign videos that are still waiting for their file.
async function canResume(videoId: string): Promise<boolean> {
	try {
		const video = await getVideo(videoId);

		return video.status === VideoStatusCode.Created;
	} catch {
		return false;
	}
}

// Creates a video and signs a TUS upload for it. Pass the videoId of an
// unfinished upload to re-sign it, so the browser can resume.
export const POST: RequestHandler = async ({ request }) => {
	// Require a signed-in user here. This route is public, and it creates videos in your library.
	const { title, videoId } = (await request.json()) as { title?: unknown; videoId?: unknown };
	if (typeof title !== "string" || !title.trim()) {
		return json({ error: "title is required" }, { status: 400 });
	}

	try {
		if (typeof videoId === "string" && (await canResume(videoId))) {
			return json(signUpload(videoId));
		}

		return json(signUpload(await createVideo(title)));
	} catch (error) {
		return json({ error: (error as Error).message }, { status: 502 });
	}
};
