import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  outputFileTracingExcludes: {
    "*": ["./data/retraction_watch.csv"],
  },
  outputFileTracingRoot: path.resolve(process.cwd(), ".."),
  // Proxy /api/* to the backend Next.js app running on port 3000
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
