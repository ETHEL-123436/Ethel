import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Explicitly disable Turbopack
    turbo: undefined,
  },
};

export default nextConfig;
