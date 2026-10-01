<script setup lang="ts">
import { ref, shallowRef } from "vue";
import type { Player, TimeUpdate } from "player.js";
import BunnyPlayer from "./BunnyPlayer.vue";

defineProps<{ libraryId: string; videoId: string }>();

const rates = [1, 1.5, 2];

const player = shallowRef<Player | null>(null);
const playing = ref(false);
const muted = ref(false);
const rate = ref(1);
const time = ref<TimeUpdate>({ seconds: 0, duration: 0 });
const log = ref<string[]>([]);

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);

  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function record(event: string) {
  log.value = [`${new Date().toLocaleTimeString()}  ${event}`, ...log.value].slice(0, 5);
}

function onReady(instance: Player) {
  player.value = instance;
  // Library settings can autoplay or start muted, so read the real state.
  instance.getPaused((paused) => (playing.value = !paused));
  instance.getMuted((isMuted) => (muted.value = isMuted));
  instance.on("playbackratechange", (value) => (rate.value = value));
  record("ready");
}

function onPlay() {
  playing.value = true;
  record("play");
}

function onPause() {
  playing.value = false;
  record("pause");
}

function onEnded() {
  playing.value = false;
  record("ended");
}

function togglePlay() {
  if (playing.value) player.value?.pause();
  else player.value?.play();
}

function toggleMute() {
  const instance = player.value;
  if (!instance) return;

  // Ask the player first, because viewers can also mute from its own controls.
  instance.getMuted((isMuted) => {
    if (isMuted) instance.unmute();
    else instance.mute();
    muted.value = !isMuted;
  });
}

function changeRate(value: number) {
  // npm player.js 0.1.0 has no setPlaybackRate(), so send the raw command.
  player.value?.send({ method: "setPlaybackRate", value });
  rate.value = value;
}
</script>

<template>
  <BunnyPlayer
    :library-id="libraryId"
    :video-id="videoId"
    :params="{ preload: true }"
    @ready="onReady"
    @play="onPlay"
    @pause="onPause"
    @ended="onEnded"
    @timeupdate="time = $event"
  />

  <progress :max="time.duration || 1" :value="time.seconds" />

  <div class="controls">
    <button type="button" :disabled="!player" @click="togglePlay">
      {{ playing ? "Pause" : "Play" }}
    </button>
    <button type="button" :disabled="!player" @click="player?.setCurrentTime(0)">Restart</button>
    <button type="button" :disabled="!player" @click="toggleMute">
      {{ muted ? "Unmute" : "Mute" }}
    </button>
    <button
      v-for="value in rates"
      :key="value"
      type="button"
      :disabled="!player"
      :aria-pressed="rate === value"
      @click="changeRate(value)"
    >
      {{ value }}x
    </button>
    <span class="time">{{ formatTime(time.seconds) }} / {{ formatTime(time.duration) }}</span>
  </div>

  <ol class="log" aria-label="Player events">
    <li v-if="log.length === 0">Waiting for the player…</li>
    <li v-for="(entry, index) in log" :key="index">{{ entry }}</li>
  </ol>
</template>
