import { getVideo } from "@/lib/bunny-stream";

export async function GET(_request: Request, { params }: RouteContext<"/api/videos/[id]">) {
  // Require a signed-in user here, and check they own this video ID. This route is public.
  const { id } = await params;

  try {
    return Response.json(await getVideo(id));
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 502 });
  }
}
