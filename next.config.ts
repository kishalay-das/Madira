import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal standalone server for Docker (set BUILD_STANDALONE=true in the image).
  // Left off locally so `npm start` works normally.
  ...(process.env.BUILD_STANDALONE === "true" ? { output: "standalone" as const } : {}),
  // Allow loading the dev server from the local network (phone / other devices).
  allowedDevOrigins: ["192.168.1.110"],
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "motion"],
  },
};

export default nextConfig;
