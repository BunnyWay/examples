import { useEffect, useState } from "react";
import type { VideoStatus } from "./index";

// Bunny Stream video statuses. 4 means every resolution has finished encoding.
const FINISHED = 4;
const FAILED = new Set([5, 6]);

export function UploadedVideo({ videoId, title }: { videoId: string; title: string }) {
  const [video, setVideo] = useState<VideoStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let active = true;

    const poll = async () => {
      let response: Response;
      let body;
      try {
        response = await fetch(`/api/videos/${videoId}`);
        body = await response.json();
      } catch {
        // A dropped connection or a non-JSON error page.
        if (active) setError("Could not reach the server to check the video");
        return;
      }
      if (!active) return;
      if (!response.ok) {
        setError(body.error ?? "Could not read the video status");
        return;
      }

      setVideo(body);
      if (body.status !== FINISHED && !FAILED.has(body.status)) {
        timer = setTimeout(poll, 3000);
      }
    };

    poll();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [videoId]);

  return (
    <article className="video">
      <h3>{title}</h3>
      {error ? <p className="error">{error}</p> : null}
      {video && FAILED.has(video.status) ? <p className="error">Bunny Stream could not encode this video.</p> : null}
      {video && video.status !== FINISHED && !FAILED.has(video.status) ? (
        <p>Encoding… {video.encodeProgress}%</p>
      ) : null}
      {video?.status === FINISHED ? (
        <iframe
          src={video.embedUrl}
          title={title}
          className="player"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : null}
    </article>
  );
}
