<script setup lang="ts">
// Runs during SSR, so the signed URL arrives with the page and the iframe
// starts loading straight away. The browser reuses it from the payload.
const { data: embed, error } = await useFetch("/api/embed");

const expiresAt = computed(() => (embed.value ? new Date(embed.value.expires * 1000) : null));
// Formatted in UTC so the server render and the browser agree on the text.
const expiresLabel = computed(() =>
  expiresAt.value?.toLocaleTimeString("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" }),
);
</script>

<template>
  <p v-if="error" class="error">Could not sign the embed URL: {{ error.message }}</p>
  <template v-else-if="embed">
    <iframe
      :src="embed.url"
      title="Video player"
      class="player"
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowfullscreen
    />
    <p v-if="expiresAt" class="expires">
      This link expires at <time :datetime="expiresAt.toISOString()">{{ expiresLabel }} UTC</time>.
      Reload the page to sign a new one.
    </p>
  </template>
</template>
