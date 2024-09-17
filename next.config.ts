import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.OUTPUT as 'export' | undefined,
  images: {
    unoptimized: process.env.OUTPUT === 'export',
  },
  experimental: {
    ppr: (process.env.OUTPUT !== 'export') && 'incremental',
  },
};

export default nextConfig;
