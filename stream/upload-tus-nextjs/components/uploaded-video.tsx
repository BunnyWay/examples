"use client";

import { useEffect, useState } from "react";
import { hasFailed, VideoStatusCode, type VideoStatus } from "@/lib/video-status";

export function UploadedVideo({ videoId, title }: { videoId: string; title: string }) {
  const [video, setVideo] = useState<VideoStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll until Bunny Stream finishes encoding or gives up.
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
      if (body.status !== VideoStatusCode.Finished && !hasFailed(body.status)) {
        timer = setTimeout(poll, 3000);
      }
    };

    poll();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [videoId]);

  if (error) return <p className="error">{error}</p>;
  if (!video) return <p>Checking the video…</p>;
  if (hasFailed(video.status)) return <p className="error">Bunny Stream could not encode {title}.</p>;
  if (video.status !== VideoStatusCode.Finished) return <p>Encoding {title}… {video.encodeProgress}%</p>;

  return (
    <iframe
      src={video.embedUrl}
      title={title}
      className="player"
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
    />
  );
}
