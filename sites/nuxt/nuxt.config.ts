const bunnyOptimizer = process.env.NUXT_PUBLIC_BUNNY_OPTIMIZER === 'true'

export default defineNuxtConfig({
  modules: ['@nuxt/image'],
  compatibilityDate: '2025-07-15',
  // With the flag on, Bunny Optimizer resizes each srcset width at the edge.
  // Off, Nuxt Image keeps its default provider and resizes at build time.
  image: bunnyOptimizer
    ? { provider: 'bunny', bunny: { baseURL: '/' }, quality: 75 }
    : {},
})
