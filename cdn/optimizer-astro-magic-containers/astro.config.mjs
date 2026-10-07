import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  image: { service: { entrypoint: "./src/bunny-image-service.ts" } },
});
