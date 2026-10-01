"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Player, TimeUpdate } from "player.js";

type PlayerJs = (typeof import("player.js"))["default"];

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

const frameStyle: CSSProperties = {
  display: "block",
  width: "100%",
  height: "auto",
  aspectRatio: "16 / 9",
  border: 0,
  background: "#000",
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
  const [playerjs, setPlayerjs] = useState<PlayerJs | null>(null);

  // Keep the latest callbacks without re-creating the player.
  const handlers = useRef({ onReady, onPlay, onPause, onEnded, onTimeUpdate });
  useEffect(() => {
    handlers.current = { onReady, onPlay, onPause, onEnded, onTimeUpdate };
  });

  // player.js reads window when imported, so load it in the browser only.
  useEffect(() => {
    let cancelled = false;
    import("player.js").then((mod) => {
      if (!cancelled) setPlayerjs(mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const query = new URLSearchParams(
    Object.entries(params ?? {}).map(([key, value]) => [key, String(value)]),
  ).toString();
  const src = `https://player.mediadelivery.net/embed/${libraryId}/${videoId}${query ? `?${query}` : ""}`;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!playerjs || !iframe) return;

    // player.js has no teardown API. This flag stops stale listeners
    // from firing after the video changes or the component unmounts.
    let active = true;
    const player = new playerjs.Player(iframe);

    player.on("ready", () => active && handlers.current.onReady?.(player));
    player.on("play", () => active && handlers.current.onPlay?.());
    player.on("pause", () => active && handlers.current.onPause?.());
    player.on("ended", () => active && handlers.current.onEnded?.());
    player.on("timeupdate", (time) => active && handlers.current.onTimeUpdate?.(time));

    return () => {
      active = false;
    };
  }, [playerjs, src]);

  // Hold the space until player.js is loaded so the iframe cannot
  // finish loading before the Player exists.
  if (!playerjs) {
    return <div style={frameStyle} aria-hidden="true" />;
  }

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={title}
      style={frameStyle}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
    />
  );
}
