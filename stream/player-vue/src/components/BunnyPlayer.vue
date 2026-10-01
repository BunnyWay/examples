<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from "vue";
import type { Player, TimeUpdate } from "player.js";

type PlayerJs = (typeof import("player.js"))["default"];

const props = withDefaults(
  defineProps<{
    libraryId: string;
    videoId: string;
    /** Player parameters such as autoplay, muted, captions, or t. */
    params?: Record<string, string | number | boolean>;
    title?: string;
  }>(),
  { title: "Video player" },
);

const emit = defineEmits<{
  ready: [player: Player];
  play: [];
  pause: [];
  ended: [];
  timeupdate: [time: TimeUpdate];
}>();

const iframe = ref<HTMLIFrameElement | null>(null);
const playerjs = shallowRef<PlayerJs | null>(null);
const player = shallowRef<Player | null>(null);

const src = computed(() => {
  const query = new URLSearchParams(
    Object.entries(props.params ?? {}).map(([key, value]) => [key, String(value)]),
  ).toString();
  return `https://player.mediadelivery.net/embed/${props.libraryId}/${props.videoId}${query ? `?${query}` : ""}`;
});

onMounted(async () => {
  // player.js reads window when imported, so load it in the browser only.
  playerjs.value = (await import("player.js")).default;
});

// The iframe is keyed by src, so this runs for every new iframe element,
// right after it is inserted and before it has finished loading.
watch(
  iframe,
  (el, _previous, onCleanup) => {
    if (!el || !playerjs.value) return;

    // player.js has no teardown API. This flag stops stale listeners
    // from firing after the video changes or the component unmounts.
    let active = true;
    const instance = new playerjs.value.Player(el);

    instance.on("ready", () => active && emit("ready", instance));
    instance.on("play", () => active && emit("play"));
    instance.on("pause", () => active && emit("pause"));
    instance.on("ended", () => active && emit("ended"));
    instance.on("timeupdate", (time) => active && emit("timeupdate", time));

    player.value = instance;
    onCleanup(() => {
      active = false;
      player.value = null;
    });
  },
  { flush: "post" },
);

defineExpose({ player });
</script>

<template>
  <iframe
    v-if="playerjs"
    ref="iframe"
    :key="src"
    :src="src"
    :title="title"
    class="bunny-player"
    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
    allowfullscreen
  />
  <!-- Hold the space until player.js is loaded so the iframe cannot
       finish loading before the Player exists. -->
  <div v-else class="bunny-player" aria-hidden="true" />
</template>

<style scoped>
.bunny-player {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  border: 0;
  background: #000;
}
</style>
