import { getVideo } from "../../utils/bunny-stream";

export default defineEventHandler(async (event) => {
  // Require a signed-in user here, and check they own this video ID. This route is public.
  try {
    return await getVideo(getRouterParam(event, "id") ?? "");
  } catch (error) {
    setResponseStatus(event, 502);
    return { error: (error as Error).message };
  }
});
