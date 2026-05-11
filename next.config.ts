import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Stable build ID prevents stale RSC chunk mismatches across deployments
  generateBuildId: async () => {
    return process.env.GIT_COMMIT_SHA ?? `build-${Date.now()}`;
  },
  async redirects() {
    return [
      { source: "/landing", destination: "/", permanent: true },
      { source: "/auth/login", destination: "/auth/signin", permanent: true },
      { source: "/login", destination: "/auth/signin", permanent: true },
      { source: "/signup", destination: "/auth/signup", permanent: true },
      { source: "/register", destination: "/auth/signup", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // Prevent RSC payload caching — avoids stale chunk 404s after redeployment
        source: "/:path*",
        has: [{ type: "query", key: "_rsc" }],
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
      {
        // COOP/COEP only on the create page — needed for ONNX SharedArrayBuffer
        // Applying globally breaks third-party images (Unsplash, HuggingFace, etc.)
        source: "/create",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
      {
        // Security headers for all routes
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  outputFileTracingExcludes: {
    "*": [
      "public/sample-images/**",
      "examples/**",
      ".git/**",
      "public/node-banana.png",
      "public/landing/**",
      "wordpress-plugin/**",
      "logs/**",
      "scratch/**",
    ],
  },
  // Note: For route handlers (.../route.ts files), body size is controlled by
  // the underlying server. For large payloads, consider using streaming or
  // increase Node.js max HTTP header size if needed.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
