import type { NextConfig } from "next";

// Set for an assets-only pull zone. Leave unset when the pull zone serves the whole site.
const cdn = process.env.NEXT_PUBLIC_CDN_URL;

// Public hostnames of a whole-site pull zone, comma separated.
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",");

const nextConfig: NextConfig = {
  output: "standalone",
  assetPrefix: cdn,
  // Next rejects Server Actions when Origin doesn't match x-forwarded-host.
  experimental: { serverActions: { allowedOrigins } },
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
