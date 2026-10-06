import { VideoStatusCode } from "#shared/bunny-stream";
import { createVideo, getVideo, signUpload } from "../utils/bunny-stream";

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
export default defineEventHandler(async (event) => {
  // Require a signed-in user here. This route is public, and it creates videos in your library.
  const { title, videoId } = await readBody<{ title?: unknown; videoId?: unknown }>(event);
  if (typeof title !== "string" || !title.trim()) {
    setResponseStatus(event, 400);
    return { error: "title is required" };
  }

  try {
    if (typeof videoId === "string" && (await canResume(videoId))) {
      return signUpload(videoId);
    }

    return signUpload(await createVideo(title));
  } catch (error) {
    setResponseStatus(event, 502);
    return { error: (error as Error).message };
  }
});
