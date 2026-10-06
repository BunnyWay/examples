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
      bunnyLibraryId: "767357",
      bunnyVideoId: "6dae38a5-9322-401a-a6e6-76e7cbb368dd",
    },
  },
});
