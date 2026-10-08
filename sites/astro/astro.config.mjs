import { defineConfig } from "astro/config";

// Off by default, so Astro keeps its built-in sharp service and resizes images at build time.
const optimizer = process.env.PUBLIC_BUNNY_OPTIMIZER === "true";

export default defineConfig({
  image: optimizer ? { service: { entrypoint: "./src/bunny-image-service.ts" } } : {},
});
