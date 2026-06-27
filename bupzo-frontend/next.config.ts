import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'lh3.googleusercontent.com'],
  },
};

export default nextConfig;
