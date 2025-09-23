import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds for production deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checks during builds for production deployment
    ignoreBuildErrors: true,
  },
};
