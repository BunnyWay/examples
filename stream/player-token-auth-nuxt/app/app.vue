<script setup lang="ts">
// The key is private runtime config, so only the server can check it.
// useState carries the answer to the browser with the rendered page.
const configured = useState("bunny-configured", () => {
  const config = useRuntimeConfig();

  return Boolean(
    config.bunnyStreamLibraryId && config.bunnyStreamVideoId && config.bunnyStreamTokenAuthKey,
  );
});
</script>

<template>
  <main>
    <h1>Token-authenticated Bunny Player in Nuxt</h1>
    <p>
      The server signs the embed URL with your library's token authentication key, so the player
      only loads with a valid, short-lived link.
    </p>
    <SignedPlayer v-if="configured" />
    <div v-else class="empty">
      Copy <code>.env.example</code> to <code>.env</code> and set
      <code>NUXT_BUNNY_STREAM_LIBRARY_ID</code>, <code>NUXT_BUNNY_STREAM_VIDEO_ID</code>, and
      <code>NUXT_BUNNY_STREAM_TOKEN_AUTH_KEY</code>, then restart the dev server.
    </div>
  </main>
</template>
