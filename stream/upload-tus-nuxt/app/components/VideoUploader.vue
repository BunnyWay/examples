<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import * as tus from "tus-js-client";
import type { UploadCredentials } from "#shared/bunny-stream";

type UploadState =
  | { phase: "idle" }
  | { phase: "uploading" | "paused"; title: string; percent: number; resumed: boolean }
  | { phase: "done"; title: string; videoId: string }
  | { phase: "error"; message: string };

const state = ref<UploadState>({ phase: "idle" });
let upload: tus.Upload | null = null;

// Remembers which Bunny video a file was going into, so a reload can resume it.
const videoKey = (file: File) => `bunny-video:${file.name}:${file.size}:${file.lastModified}`;

async function requestUpload(title: string, videoId: string | null): Promise<UploadCredentials> {
  const response = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, videoId }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Could not create the upload");

  return body;
}

async function start(file: File) {
  const title = file.name;
  const key = videoKey(file);
  const savedVideoId = localStorage.getItem(key);
  state.value = { phase: "uploading", title, percent: 0, resumed: false };

  let credentials: UploadCredentials;
  try {
    credentials = await requestUpload(title, savedVideoId);
  } catch (error) {
    state.value = { phase: "error", message: (error as Error).message };
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
      if (state.value.phase === "paused") return;
      state.value = { phase: "uploading", title, percent: Math.floor((bytesSent / bytesTotal) * 100), resumed };
    },
    onSuccess() {
      localStorage.removeItem(key);
      state.value = { phase: "done", title, videoId: credentials.videoId };
    },
    onError(error) {
      state.value = { phase: "error", message: error.message };
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

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) start(file);
}

function pause() {
  upload?.abort();
  if (state.value.phase === "uploading") state.value = { ...state.value, phase: "paused" };
}

function resume() {
  upload?.start();
  if (state.value.phase === "paused") state.value = { ...state.value, phase: "uploading" };
}

function reset() {
  upload?.abort();
  upload = null;
  state.value = { phase: "idle" };
}

// Stop sending chunks if the component goes away mid-upload.
onBeforeUnmount(() => upload?.abort());
</script>

<template>
  <label v-if="state.phase === 'idle'" class="dropzone">
    <span>Choose a video to upload</span>
    <input type="file" accept="video/*" @change="onFileChange" />
  </label>

  <div v-else-if="state.phase === 'error'">
    <p class="error">{{ state.message }}</p>
    <div class="controls">
      <button type="button" @click="reset">Try again</button>
    </div>
  </div>

  <div v-else-if="state.phase === 'done'">
    <UploadedVideo :video-id="state.videoId" :title="state.title" />
    <div class="controls">
      <button type="button" @click="reset">Upload another</button>
    </div>
  </div>

  <div v-else>
    <p>
      {{ state.phase === "paused" ? "Paused" : "Uploading" }} {{ state.title }}
      <template v-if="state.resumed">(resumed from a previous session)</template>
    </p>
    <progress :max="100" :value="state.percent" />
    <div class="controls">
      <button v-if="state.phase === 'uploading'" type="button" @click="pause">Pause</button>
      <button v-else type="button" @click="resume">Resume</button>
      <button type="button" @click="reset">Cancel</button>
      <span class="time">{{ state.percent }}%</span>
    </div>
  </div>
</template>
