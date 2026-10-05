import playerjs, { type Player } from "player.js";

export type BunnyPlayerOptions = {
  libraryId: string;
  videoId: string;
  /** Player parameters such as autoplay, muted, captions, or t. */
  params?: Record<string, string | number | boolean>;
  title?: string;
};

export function createBunnyPlayer(
  container: HTMLElement,
  { libraryId, videoId, params, title = "Video player" }: BunnyPlayerOptions,
): Player {
  const query = new URLSearchParams(
    Object.entries(params ?? {}).map(([key, value]) => [key, String(value)]),
  ).toString();

  const iframe = document.createElement("iframe");
  iframe.src = `https://player.mediadelivery.net/embed/${libraryId}/${videoId}${query ? `?${query}` : ""}`;
  iframe.title = title;
  iframe.loading = "lazy";
  iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
  iframe.allowFullscreen = true;
  Object.assign(iframe.style, {
    display: "block",
    width: "100%",
    height: "auto",
    aspectRatio: "16 / 9",
    border: "0",
    background: "#000",
  });
  container.append(iframe);

  // Create the Player before the iframe finishes loading so it catches the ready message.
  return new playerjs.Player(iframe);
}
