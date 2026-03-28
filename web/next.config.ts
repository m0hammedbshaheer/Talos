import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  outputFileTracingRoot: path.resolve(process.cwd(), ".."),
};

export default nextConfig;
