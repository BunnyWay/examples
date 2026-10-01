import { json } from "@sveltejs/kit";
import { getVideo } from "$lib/server/bunny-stream";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
	try {
		return json(await getVideo(params.id));
	} catch (error) {
		return json({ error: (error as Error).message }, { status: 502 });
	}
};
