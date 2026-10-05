// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/main.css"],
  app: {
    head: { title: "Token-authenticated Bunny Player in Nuxt" },
  },
  runtimeConfig: {
    // Private, so only the server sees them. Set with NUXT_BUNNY_STREAM_LIBRARY_ID,
    // NUXT_BUNNY_STREAM_VIDEO_ID, and NUXT_BUNNY_STREAM_TOKEN_AUTH_KEY.
    bunnyStreamLibraryId: "",
    bunnyStreamVideoId: "",
    bunnyStreamTokenAuthKey: "",
  },
});
