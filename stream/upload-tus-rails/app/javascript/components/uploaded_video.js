import { element } from "components/element";

// Bunny Stream video statuses this example cares about.
const VideoStatusCode = { Finished: 4, Error: 5, UploadFailed: 6 };

const hasFailed = (status) => status === VideoStatusCode.Error || status === VideoStatusCode.UploadFailed;

// Polls a video until Bunny Stream finishes encoding or gives up, then renders the player.
export class UploadedVideo {
  #root;
  #videoId;
  #title;
  #timer;
  #active = true;

  constructor(root, { videoId, title }) {
    this.#root = root;
    this.#videoId = videoId;
    this.#title = title;
    this.#show(element("p", {}, "Checking the video…"));
    this.#poll();
  }

  stop() {
    this.#active = false;
    clearTimeout(this.#timer);
  }

  async #poll() {
    let response;
    let body;
    try {
      response = await fetch(`/api/videos/${this.#videoId}`);
      body = await response.json();
    } catch {
      // A dropped connection or a non-JSON error page.
      if (this.#active) this.#show(element("p", { class: "error" }, "Could not reach the server to check the video"));
      return;
    }
    if (!this.#active) return;
    if (!response.ok) {
      this.#show(element("p", { class: "error" }, body.error ?? "Could not read the video status"));
      return;
    }

    this.#render(body);
    if (body.status !== VideoStatusCode.Finished && !hasFailed(body.status)) {
      this.#timer = setTimeout(() => this.#poll(), 3000);
    }
  }

  #render({ status, encodeProgress, embedUrl }) {
    if (hasFailed(status)) {
      this.#show(element("p", { class: "error" }, `Bunny Stream could not encode ${this.#title}.`));
    } else if (status !== VideoStatusCode.Finished) {
      this.#show(element("p", {}, `Encoding ${this.#title}… ${encodeProgress}%`));
    } else {
      this.#show(
        element("iframe", {
          src: embedUrl,
          title: this.#title,
          class: "player",
          allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
          allowfullscreen: "",
        }),
      );
    }
  }

  #show(node) {
    this.#root.replaceChildren(node);
  }
}
