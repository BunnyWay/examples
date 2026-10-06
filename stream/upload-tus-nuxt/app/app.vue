<script setup lang="ts">
// The API key is private runtime config, so only the server can check it.
// useState carries the answer to the browser with the rendered page.
const configured = useState("bunny-configured", () => {
  const config = useRuntimeConfig();

  return Boolean(config.bunnyStreamLibraryId && config.bunnyStreamApiKey);
});
</script>

<template>
  <main>
    <h1>Upload to Bunny Stream with TUS</h1>
    <p>
      The browser sends the file straight to Bunny Stream. Pause it, or reload the page halfway
      through and pick the same file to carry on.
    </p>
    <VideoUploader v-if="configured" />
    <div v-else class="empty">
      Set <code>NUXT_BUNNY_STREAM_LIBRARY_ID</code> and <code>NUXT_BUNNY_STREAM_API_KEY</code>. For
      <code>bun dev</code>, copy <code>.env.example</code> to <code>.env</code> and restart. In
      production, set them in your host's environment.
    </div>
  </main>
</template>
