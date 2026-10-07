import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Writes each page as about/index.html, which Bunny Storage serves for /about/.
  trailingSlash: true,
  images: {
    loader: "custom",
    loaderFile: "./lib/bunny-loader.ts",
    // Next 16 only allows quality 75 unless you list others here.
    qualities: [50, 75],
  },
};

export default nextConfig;
