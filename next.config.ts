import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.OUTPUT as 'export' | undefined,
  images: {
    unoptimized: process.env.OUTPUT === 'export',
  },
};

export default nextConfig;
