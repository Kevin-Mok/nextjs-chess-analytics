import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  experimental: {
    webpackBuildWorker: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
