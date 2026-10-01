<script setup lang="ts">
import DemoPlayer from "./components/DemoPlayer.vue";

const libraryId = import.meta.env.VITE_BUNNY_LIBRARY_ID;
const videoId = import.meta.env.VITE_BUNNY_VIDEO_ID;
</script>

<template>
  <main>
    <h1>Bunny Player with Vue</h1>
    <template v-if="libraryId && videoId">
      <p>An embedded Bunny Stream video controlled from Vue with <code>player.js</code>.</p>
      <DemoPlayer :library-id="libraryId" :video-id="videoId" />
    </template>
    <div v-else class="empty">
      Set <code>VITE_BUNNY_LIBRARY_ID</code> and <code>VITE_BUNNY_VIDEO_ID</code> in
      <code>.env</code>, then restart the dev server.
    </div>
  </main>
</template>
