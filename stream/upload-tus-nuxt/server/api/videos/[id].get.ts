import { getVideo } from "../../utils/bunny-stream";

export default defineEventHandler(async (event) => {
  try {
    return await getVideo(getRouterParam(event, "id") ?? "");
  } catch (error) {
    setResponseStatus(event, 502);
    return { error: (error as Error).message };
  }
});
