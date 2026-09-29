import * as tus from "tus-js-client";
import { element } from "./element";
import { mountUploadedVideo } from "./uploaded-video";

// Remembers which Bunny video a file was going into, so a reload can resume it.
const videoKey = (file) => `bunny-video:${file.name}:${file.size}:${file.lastModified}`;

async function requestUpload(title, videoId) {
  const response = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, videoId }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Could not create the upload");

  return body;
}

// state is one of:
//   { phase: "idle" }
//   { phase: "uploading" | "paused", title, percent, resumed }
//   { phase: "done", title, videoId }
//   { phase: "error", message }
export function mountVideoUploader(root) {
  let state = { phase: "idle" };
  let upload = null;
  let stopPolling = null;
  let showProgress = null;

  function setState(next) {
    state = next;
    render();
  }

  async function start(file) {
    const title = file.name;
    const key = videoKey(file);
    const savedVideoId = localStorage.getItem(key);
    setState({ phase: "uploading", title, percent: 0, resumed: false });

    let credentials;
    try {
      credentials = await requestUpload(title, savedVideoId);
    } catch (error) {
      setState({ phase: "error", message: error.message });
      return;
    }
    localStorage.setItem(key, credentials.videoId);

    let resumed = false;
    upload = new tus.Upload(file, {
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
      onProgress(bytesSent, bytesTotal) {
        if (state.phase !== "uploading") return;
        // Update the bar in place, so a re-render never swallows a click on Pause.
        state = { ...state, percent: Math.floor((bytesSent / bytesTotal) * 100), resumed };
        showProgress();
      },
      onSuccess() {
        localStorage.removeItem(key);
        setState({ phase: "done", title, videoId: credentials.videoId });
      },
      onError(error) {
        setState({ phase: "error", message: error.message });
      },
    });

    // The stored upload URL belongs to one video. Only resume when the server
    // re-signed that same video, otherwise start over in the new one.
    const previous = await upload.findPreviousUploads();
    if (credentials.videoId === savedVideoId && previous[0]) {
      upload.resumeFromPreviousUpload(previous[0]);
      resumed = true;
    }
    upload.start();
  }

  function pause() {
    upload?.abort();
    if (state.phase === "uploading") setState({ ...state, phase: "paused" });
  }

  function resume() {
    upload?.start();
    if (state.phase === "paused") setState({ ...state, phase: "uploading" });
  }

  function reset() {
    upload?.abort();
    upload = null;
    setState({ phase: "idle" });
  }

  const button = (label, onclick) => element("button", { type: "button", onclick }, label);

  function view() {
    if (state.phase === "idle") {
      const input = element("input", {
        type: "file",
        accept: "video/*",
        onchange: () => {
          const file = input.files?.[0];
          if (file) start(file);
        },
      });

      return element("label", { className: "dropzone" }, element("span", {}, "Choose a video to upload"), input);
    }

    if (state.phase === "error") {
      return element(
        "div",
        {},
        element("p", { className: "error" }, state.message),
        element("div", { className: "controls" }, button("Try again", reset)),
      );
    }

    if (state.phase === "done") {
      const video = element("div");
      stopPolling = mountUploadedVideo(video, { videoId: state.videoId, title: state.title });

      return element("div", {}, video, element("div", { className: "controls" }, button("Upload another", reset)));
    }

    const status = element("p");
    const bar = element("progress", { max: 100 });
    const percent = element("span", { className: "time" });
    showProgress = () => {
      const resumed = state.resumed ? " (resumed from a previous session)" : "";
      status.textContent = `${state.phase === "paused" ? "Paused" : "Uploading"} ${state.title}${resumed}`;
      bar.value = state.percent;
      percent.textContent = `${state.percent}%`;
    };
    showProgress();

    return element(
      "div",
      {},
      status,
      bar,
      element(
        "div",
        { className: "controls" },
        state.phase === "uploading" ? button("Pause", pause) : button("Resume", resume),
        button("Cancel", reset),
        percent,
      ),
    );
  }

  function render() {
    stopPolling?.();
    stopPolling = null;
    root.replaceChildren(view());
  }

  render();
}
