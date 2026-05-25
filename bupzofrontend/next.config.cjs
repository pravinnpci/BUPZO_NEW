const { withMdx } = require('@next/mdx');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['picsum.photos'],
  },
  experimental: {
    appDir: true,
  },
  // Configure basePath based on environment variable
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

module.exports = withMdx(nextConfig);