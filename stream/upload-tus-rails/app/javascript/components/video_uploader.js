import * as tus from "tus-js-client";
import { element } from "components/element";
import { UploadedVideo } from "components/uploaded_video";

// Remembers which Bunny video a file was going into, so a reload can resume it.
const videoKey = (file) => `bunny-video:${file.name}:${file.size}:${file.lastModified}`;

async function requestUpload(title, videoId) {
  const response = await fetch("/api/uploads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Rails rejects a POST without the token from csrf_meta_tags.
      "X-CSRF-Token": document.querySelector("meta[name='csrf-token']").content,
    },
    body: JSON.stringify({ title, videoId }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Could not create the upload");

  return body;
}

// Renders the upload into root as one of: idle, uploading, paused, done, or error.
export class VideoUploader {
  #root;
  #state = { phase: "idle" };
  #upload = null;
  #video = null;
  #progressView = null;

  constructor(root) {
    this.#root = root;
    this.#render();
  }

  async #start(file) {
    const title = file.name;
    const key = videoKey(file);
    const savedVideoId = localStorage.getItem(key);
    this.#setState({ phase: "uploading", title, percent: 0, resumed: false });

    let credentials;
    try {
      credentials = await requestUpload(title, savedVideoId);
    } catch (error) {
      this.#setState({ phase: "error", message: error.message });
      return;
    }
    localStorage.setItem(key, credentials.videoId);

    let resumed = false;
    const upload = new tus.Upload(file, {
      endpoint: "https://video.bunnycdn.com/tusupload",
      retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
      removeFingerprintOnSuccess: true,
      headers: {
        AuthorizationSignature: credentials.signature,
        AuthorizationExpire: String(credentials.expirationTime),
        VideoId: credentials.videoId,
        LibraryId: credentials.libraryId,
      },
      metadata: { filetype: file.type, title },
      onProgress: (bytesSent, bytesTotal) => {
        if (this.#state.phase !== "uploading") return;
        const percent = Math.floor((bytesSent / bytesTotal) * 100);
        this.#setState({ phase: "uploading", title, percent, resumed });
      },
      onSuccess: () => {
        localStorage.removeItem(key);
        this.#setState({ phase: "done", title, videoId: credentials.videoId });
      },
      onError: (error) => {
        this.#setState({ phase: "error", message: error.message });
      },
    });
    this.#upload = upload;

    // The stored upload URL belongs to one video. Only resume when the server
    // re-signed that same video, otherwise start over in the new one.
    const previous = await upload.findPreviousUploads();
    if (credentials.videoId === savedVideoId && previous[0]) {
      upload.resumeFromPreviousUpload(previous[0]);
      resumed = true;
    }
    upload.start();
  }

  #pause() {
    this.#upload?.abort();
    if (this.#state.phase === "uploading") this.#setState({ ...this.#state, phase: "paused" });
  }

  #resume() {
    this.#upload?.start();
    if (this.#state.phase === "paused") this.#setState({ ...this.#state, phase: "uploading" });
  }

  #reset() {
    this.#upload?.abort();
    this.#upload = null;
    this.#setState({ phase: "idle" });
  }

  #setState(state) {
    this.#state = state;
    this.#render();
  }

  #render() {
    const state = this.#state;
    if (state.phase === "uploading" || state.phase === "paused") {
      this.#renderProgress(state);
      return;
    }

    this.#progressView = null;
    this.#video?.stop();
    this.#video = null;

    if (state.phase === "idle") {
      const input = element("input", { type: "file", accept: "video/*" });
      input.addEventListener("change", () => {
        const file = input.files[0];
        if (file) this.#start(file);
      });
      this.#root.replaceChildren(
        element("label", { class: "dropzone" }, element("span", {}, "Choose a video to upload"), input),
      );
    } else if (state.phase === "error") {
      this.#root.replaceChildren(
        element("p", { class: "error" }, state.message),
        this.#controls(this.#button("Try again", () => this.#reset())),
      );
    } else {
      const player = element("div");
      this.#video = new UploadedVideo(player, state);
      this.#root.replaceChildren(player, this.#controls(this.#button("Upload another", () => this.#reset())));
    }
  }

  // Built once and then updated in place, so progress events don't swap the buttons mid-click.
  #renderProgress({ phase, title, percent, resumed }) {
    if (!this.#progressView) {
      const label = element("p");
      const bar = element("progress", { max: 100 });
      const toggle = this.#button("", () => (this.#state.phase === "uploading" ? this.#pause() : this.#resume()));
      const time = element("span", { class: "time" });
      this.#root.replaceChildren(
        label,
        bar,
        this.#controls(
          toggle,
          this.#button("Cancel", () => this.#reset()),
          time,
        ),
      );
      this.#progressView = { label, bar, toggle, time };
    }

    const { label, bar, toggle, time } = this.#progressView;
    label.textContent = `${phase === "paused" ? "Paused" : "Uploading"} ${title}${resumed ? " (resumed from a previous session)" : ""}`;
    bar.value = percent;
    toggle.textContent = phase === "uploading" ? "Pause" : "Resume";
    time.textContent = `${percent}%`;
  }

  #controls(...children) {
    return element("div", { class: "controls" }, ...children);
  }

  #button(label, onClick) {
    const button = element("button", { type: "button" }, label);
    button.addEventListener("click", onClick);

    return button;
  }
}
