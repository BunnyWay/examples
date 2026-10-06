import { json } from "@sveltejs/kit";
import { getVideo } from "#lib/server/bunny-stream.ts";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
	// Require a signed-in user here, and check they own this video ID. This route is public.
	try {
		return json(await getVideo(params.id));
	} catch (error) {
		return json({ error: (error as Error).message }, { status: 502 });
	}
};
