import { createVideo, getVideo, signUpload } from "@/lib/bunny-stream";
import { VideoStatusCode } from "@/lib/video-status";

// Creates a video and signs a TUS upload for it. Pass the videoId of an
// unfinished upload to re-sign it, so the browser can resume.
export async function POST(request: Request) {
  // Require a signed-in user here. This route is public, and it creates videos in your library.
  const { title, videoId } = (await request.json()) as { title?: unknown; videoId?: unknown };
  if (typeof title !== "string" || !title.trim()) {
    return Response.json({ error: "title is required" }, { status: 400 });
  }

  try {
    if (typeof videoId === "string" && (await canResume(videoId))) {
      return Response.json(signUpload(videoId));
    }

    return Response.json(signUpload(await createVideo(title)));
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 502 });
  }
}

// Only re-sign videos that are still waiting for their file.
async function canResume(videoId: string): Promise<boolean> {
  try {
    const video = await getVideo(videoId);

    return video.status === VideoStatusCode.Created;
  } catch {
    return false;
  }
}
