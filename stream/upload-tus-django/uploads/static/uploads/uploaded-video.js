import { h } from "./dom.js";

// Bunny Stream video statuses this example cares about.
const VideoStatusCode = { Finished: 4, Error: 5, UploadFailed: 6 };

function hasFailed(status) {
  return status === VideoStatusCode.Error || status === VideoStatusCode.UploadFailed;
}

// Polls until Bunny Stream finishes encoding or gives up, then renders the
// player into `container`. Returns a function that stops polling.
export function mountUploadedVideo(container, { videoId, title }) {
  let timer;
  let active = true;

  const show = (element) => container.replaceChildren(element);

  const poll = async () => {
    const response = await fetch(`/api/videos/${encodeURIComponent(videoId)}`);
    const body = await response.json();
    if (!active) return;
    if (!response.ok) {
      show(h("p", { className: "error" }, body.error ?? "Could not read the video status"));
      return;
    }

    if (hasFailed(body.status)) {
      show(h("p", { className: "error" }, `Bunny Stream could not encode ${title}.`));
    } else if (body.status !== VideoStatusCode.Finished) {
      show(h("p", {}, `Encoding ${title}… ${body.encodeProgress}%`));
      timer = setTimeout(poll, 3000);
    } else {
      show(
        h("iframe", {
          src: body.embedUrl,
          title,
          className: "player",
          allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
          allowFullscreen: true,
        }),
      );
    }
  };

  show(h("p", {}, "Checking the video…"));
  poll();

  return () => {
    active = false;
    clearTimeout(timer);
  };
}
