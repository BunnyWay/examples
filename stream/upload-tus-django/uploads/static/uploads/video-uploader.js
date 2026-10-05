import * as tus from "https://cdn.jsdelivr.net/npm/tus-js-client@4.3.1/+esm";
import { h } from "./dom.js";
import { mountUploadedVideo } from "./uploaded-video.js";

// One of:
//   { phase: "idle" }
//   { phase: "uploading" | "paused", title, percent, resumed }
//   { phase: "done", title, videoId }
//   { phase: "error", message }
let state = { phase: "idle" };
let upload = null;
let stopPolling = null;
// The progress view is built once and updated in place, so the buttons stay
// clickable while progress events stream in.
let progressView = null;

const root = document.querySelector("#video-uploader");
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

// Remembers which Bunny video a file was going into, so a reload can resume it.
const videoKey = (file) => `bunny-video:${file.name}:${file.size}:${file.lastModified}`;

async function requestUpload(title, videoId) {
  const response = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
    body: JSON.stringify({ title, videoId }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Could not create the upload");

  return body;
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
      const percent = Math.floor((bytesSent / bytesTotal) * 100);
      setState((current) => (current.phase === "paused" ? current : { phase: "uploading", title, percent, resumed }));
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
  setState((current) => (current.phase === "uploading" ? { ...current, phase: "paused" } : current));
}

function resume() {
  upload?.start();
  setState((current) => (current.phase === "paused" ? { ...current, phase: "uploading" } : current));
}

function reset() {
  upload?.abort();
  upload = null;
  stopPolling?.();
  stopPolling = null;
  setState({ phase: "idle" });
}

function setState(next) {
  state = typeof next === "function" ? next(state) : next;
  render();
}

const button = (label, onclick) => h("button", { type: "button", onclick }, label);

function render() {
  if (state.phase === "uploading" || state.phase === "paused") {
    renderProgress();
    return;
  }
  progressView = null;

  if (state.phase === "idle") {
    const input = h("input", { type: "file", accept: "video/*" });
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (file) start(file);
    });
    root.replaceChildren(h("label", { className: "dropzone" }, h("span", {}, "Choose a video to upload"), input));
    return;
  }

  if (state.phase === "error") {
    root.replaceChildren(
      h("div", {}, h("p", { className: "error" }, state.message), h("div", { className: "controls" }, button("Try again", reset))),
    );
    return;
  }

  const video = h("div");
  root.replaceChildren(h("div", {}, video, h("div", { className: "controls" }, button("Upload another", reset))));
  stopPolling = mountUploadedVideo(video, state);
}

function renderProgress() {
  if (!progressView) {
    progressView = {
      label: h("p"),
      bar: h("progress", { max: 100 }),
      toggle: h("button", { type: "button" }),
      percent: h("span", { className: "time" }),
    };
    const { label, bar, toggle, percent } = progressView;
    root.replaceChildren(h("div", {}, label, bar, h("div", { className: "controls" }, toggle, button("Cancel", reset), percent)));
  }

  const paused = state.phase === "paused";
  const { label, bar, toggle, percent } = progressView;
  label.textContent = `${paused ? "Paused" : "Uploading"} ${state.title}${state.resumed ? " (resumed from a previous session)" : ""}`;
  bar.value = state.percent;
  toggle.textContent = paused ? "Resume" : "Pause";
  toggle.onclick = paused ? resume : pause;
  percent.textContent = `${state.percent}%`;
}

render();
