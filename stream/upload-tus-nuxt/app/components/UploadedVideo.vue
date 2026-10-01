<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { hasFailed, VideoStatusCode, type VideoStatus } from "#shared/bunny-stream";

const props = defineProps<{ videoId: string; title: string }>();

const video = ref<VideoStatus | null>(null);
const error = ref<string | null>(null);
let timer: ReturnType<typeof setTimeout> | undefined;
let active = true;

// Poll until Bunny Stream finishes encoding or gives up.
async function poll() {
  const response = await fetch(`/api/videos/${props.videoId}`);
  const body = await response.json();
  if (!active) return;
  if (!response.ok) {
    error.value = body.error ?? "Could not read the video status";
    return;
  }

  video.value = body;
  if (body.status !== VideoStatusCode.Finished && !hasFailed(body.status)) {
    timer = setTimeout(poll, 3000);
  }
}

onMounted(poll);
onBeforeUnmount(() => {
  active = false;
  clearTimeout(timer);
});
</script>

<template>
  <p v-if="error" class="error">{{ error }}</p>
  <p v-else-if="!video">Checking the video…</p>
  <p v-else-if="hasFailed(video.status)" class="error">Bunny Stream could not encode {{ title }}.</p>
  <p v-else-if="video.status !== VideoStatusCode.Finished">Encoding {{ title }}… {{ video.encodeProgress }}%</p>
  <iframe
    v-else
    :src="video.embedUrl"
    :title="title"
    class="player"
    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
    allowfullscreen
  />
</template>
