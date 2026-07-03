import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.0.0.2', 'localhost'],
  // Fix for workspace root inference issues that can cause EPERM/permission errors when traversing up to Desktop
  outputFileTracingRoot: __dirname,
  // Supabase friendly settings
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
