import { element } from "./element";
import { hasFailed, VideoStatusCode } from "./video-status";

// Renders a video's status into root, then Bunny Player once it has encoded.
// Returns a function that stops polling.
export function mountUploadedVideo(root, { videoId, title }) {
  let timer;
  let active = true;
  const show = (node) => root.replaceChildren(node);

  function render(video) {
    if (hasFailed(video.status)) {
      show(element("p", { className: "error" }, `Bunny Stream could not encode ${title}.`));
    } else if (video.status !== VideoStatusCode.Finished) {
      show(element("p", {}, `Encoding ${title}… ${video.encodeProgress}%`));
    } else {
      show(
        element("iframe", {
          src: video.embedUrl,
          title,
          className: "player",
          allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
          allowFullscreen: true,
        }),
      );
    }
  }

  // Poll until Bunny Stream finishes encoding or gives up.
  async function poll() {
    let response;
    let body;
    try {
      response = await fetch(`/api/videos/${videoId}`);
      body = await response.json();
    } catch {
      // A dropped connection or a non-JSON error page.
      if (active) show(element("p", { className: "error" }, "Could not reach the server to check the video"));
      return;
    }
    if (!active) return;
    if (!response.ok) {
      show(element("p", { className: "error" }, body.error ?? "Could not read the video status"));
      return;
    }

    render(body);
    if (body.status !== VideoStatusCode.Finished && !hasFailed(body.status)) {
      timer = setTimeout(poll, 3000);
    }
  }

  show(element("p", {}, "Checking the video…"));
  poll();

  return () => {
    active = false;
    clearTimeout(timer);
  };
}
