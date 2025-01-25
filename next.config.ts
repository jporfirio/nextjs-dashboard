import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: "incremental",
    dynamicIO: true,
  },
};

export default nextConfig;
