import type { NextConfig } from "next";

// Off by default, so next/image serves the original file.
const optimizer = process.env.NEXT_PUBLIC_BUNNY_OPTIMIZER === "true";

const nextConfig: NextConfig = {
  output: "export",
  // Writes each page as about/index.html, which Bunny Storage serves for /about/.
  trailingSlash: true,
  images: optimizer
    ? { loader: "custom", loaderFile: "./lib/bunny-loader.ts" }
    : { unoptimized: true },
};

export default nextConfig;
