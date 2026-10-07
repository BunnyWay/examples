import { defineConfig } from "astro/config";
import node from "@astrojs/node";

// Assets and images only: your pull zone URL. Leave unset when the pull zone serves the whole site.
const cdn = process.env.CDN_URL;

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  build: { assetsPrefix: cdn },
  image: {
    service: { entrypoint: "./src/bunny-image-service.ts", config: { baseURL: cdn } },
  },
});
