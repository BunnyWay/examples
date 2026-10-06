import { useEffect, useRef } from "react";
import playerjs, { type Player, type TimeUpdate } from "player.js";

export type BunnyPlayerProps = {
  libraryId: string;
  videoId: string;
  /** Player parameters such as autoplay, muted, captions, or t. */
  params?: Record<string, string | number | boolean>;
  title?: string;
  onReady?: (player: Player) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (time: TimeUpdate) => void;
};

export function BunnyPlayer({
  libraryId,
  videoId,
  params,
  title = "Video player",
  onReady,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
}: BunnyPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Keep the latest callbacks without re-creating the player.
  const handlers = useRef({ onReady, onPlay, onPause, onEnded, onTimeUpdate });
  useEffect(() => {
    handlers.current = { onReady, onPlay, onPause, onEnded, onTimeUpdate };
  });

  const query = new URLSearchParams(
    Object.entries(params ?? {}).map(([key, value]) => [key, String(value)]),
  ).toString();
  const src = `https://player.mediadelivery.net/embed/${libraryId}/${videoId}${query ? `?${query}` : ""}`;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let onMessage: EventListener = () => {};
    const addEvent = playerjs.addEvent;
    playerjs.addEvent = (elem, type, handler) => addEvent(elem, type, (onMessage = handler));
    const player = new playerjs.Player(iframe);
    playerjs.addEvent = addEvent;

    player.on("ready", () => handlers.current.onReady?.(player));
    player.on("play", () => handlers.current.onPlay?.());
    player.on("pause", () => handlers.current.onPause?.());
    player.on("ended", () => handlers.current.onEnded?.());
    player.on("timeupdate", (time) => handlers.current.onTimeUpdate?.(time));

    return () => window.removeEventListener("message", onMessage);
  }, [src]);

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={title}
      loading="lazy"
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        aspectRatio: "16 / 9",
        border: 0,
        background: "#000",
      }}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
    />
  );
}
