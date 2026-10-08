import type { ExternalImageService } from "astro";
import { baseService } from "astro/assets";

// Astro builds the srcset, and this service only writes each URL, so nothing is resized at build time.
const service: ExternalImageService<{ baseURL?: string }> = {
  ...baseService,
  getURL(options, imageConfig) {
    const base = imageConfig.service.config?.baseURL;
    const src = typeof options.src === "string" ? options.src : options.src.src;

    // Optimizer only resizes files on your own pull zone.
    const absolute = /^(https?:)?\/\//.test(src);
    if (absolute && !(base && src.startsWith(base))) return src;

    const url = new URL(src, base || "http://localhost");
    if (options.width) url.searchParams.set("width", String(options.width));
    url.searchParams.set("quality", String(options.quality ?? 75));
    return base || absolute ? url.href : url.pathname + url.search;
  },
};

export default service;
