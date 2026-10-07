import { defineConfig } from "astro/config";

export default defineConfig({
  image: { service: { entrypoint: "./src/bunny-image-service.ts" } },
});
