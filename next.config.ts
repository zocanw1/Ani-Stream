import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://www.sankavollerei.com",
  "frame-src https:",
  "media-src 'self' blob: https:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.sankavollerei.com",
      },
      {
        protocol: "https",
        hostname: "samehadaku.how",
      },
      {
        protocol: "https",
        hostname: "*.samehadaku.how",
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
