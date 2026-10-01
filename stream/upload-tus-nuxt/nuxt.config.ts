// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/main.css"],
  app: {
    head: { title: "Upload to Bunny Stream with TUS" },
  },
  runtimeConfig: {
    // Private, so only the server sees them. Set with NUXT_BUNNY_STREAM_LIBRARY_ID
    // and NUXT_BUNNY_STREAM_API_KEY.
    bunnyStreamLibraryId: "",
    bunnyStreamApiKey: "",
  },
});
