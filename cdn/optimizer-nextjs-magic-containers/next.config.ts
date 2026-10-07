import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    loader: "custom",
    loaderFile: "./lib/bunny-loader.ts",
    // Next 16 only allows quality 75 unless you list others here.
    qualities: [50, 75],
  },
  async headers() {
    return [
      {
        // Next serves public files with max-age=0, so the pull zone would refetch them on every request.
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
    ];
  },
};

export default nextConfig;
