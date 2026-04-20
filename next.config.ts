import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/auth/login", destination: "/auth/signin", permanent: true },
      { source: "/login", destination: "/auth/signin", permanent: true },
      { source: "/signup", destination: "/auth/signup", permanent: true },
      { source: "/register", destination: "/auth/signup", permanent: true },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb", // Increased for large media files
    },
  },
  // Note: For route handlers (.../route.ts files), body size is controlled by
  // the underlying server. For large payloads, consider using streaming or
  // increase Node.js max HTTP header size if needed.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
