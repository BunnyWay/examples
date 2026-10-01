<script setup lang="ts">
const config = useRuntimeConfig().public;

// Nuxt parses NUXT_PUBLIC_* values, so a numeric library ID arrives as a number.
const libraryId = String(config.bunnyLibraryId);
const videoId = String(config.bunnyVideoId);
</script>

<template>
  <main>
    <h1>Bunny Player with Nuxt</h1>
    <template v-if="config.bunnyLibraryId && config.bunnyVideoId">
      <p>
        The server renders a placeholder, then the browser loads <code>player.js</code> and swaps
        in the player.
      </p>
      <DemoPlayer :library-id="libraryId" :video-id="videoId" />
    </template>
    <div v-else class="empty">
      Set <code>NUXT_PUBLIC_BUNNY_LIBRARY_ID</code> and <code>NUXT_PUBLIC_BUNNY_VIDEO_ID</code> in
      <code>.env</code>, then restart the dev server.
    </div>
  </main>
</template>
