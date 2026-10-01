// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/main.css"],
  app: {
    head: { title: "Bunny Player with Nuxt" },
  },
  runtimeConfig: {
    public: {
      // Set with NUXT_PUBLIC_BUNNY_LIBRARY_ID and NUXT_PUBLIC_BUNNY_VIDEO_ID.
      bunnyLibraryId: "",
      bunnyVideoId: "",
    },
  },
});
