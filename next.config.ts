import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.sankavollerei.com",
      },
      {
        protocol: "https",
        hostname: "otakudesu.blog",
      },
      {
        protocol: "https",
        hostname: "*.otakudesu.blog",
      },
      {
        protocol: "https",
        hostname: "otakudesu.cloud",
      },
      {
        protocol: "https",
        hostname: "*.otakudesu.cloud",
      },
      {
        protocol: "https",
        hostname: "*.wp.com",
      },
    ],
  },
};

export default nextConfig;
