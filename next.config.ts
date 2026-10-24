import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Don't advertise the framework in responses.
  poweredByHeader: false,
  images: {
    // Product photography is served from Unsplash's CDN (see
    // src/lib/data/product-images.ts). Scoped to that one host so a compromised or
    // mistyped image URL can't turn the optimizer into an open proxy.
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
  // Pin the workspace root explicitly — without this, Turbopack scans upward and can
  // pick up an unrelated lockfile in a parent directory (e.g. the user's home folder),
  // which produces a misleading "inferred workspace root" warning on every dev/build run.
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
