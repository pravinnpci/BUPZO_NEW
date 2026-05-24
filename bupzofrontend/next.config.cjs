const path = require('path');

module.exports = {
  output: 'standalone',
  distDir: 'dist',
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/utils/api': path.resolve(__dirname, 'src/utils/api.ts'),
      '@/store/authStore': path.resolve(__dirname, 'src/store/authStore.ts'),
      '@/store/cartStore': path.resolve(__dirname, 'src/store/cartStore.ts'),
      '@/components/ui/button': path.resolve(__dirname, 'src/components/ui/button.tsx'),
      '@/components/ui/input': path.resolve(__dirname, 'src/components/ui/input.tsx'),
      '@/components/ui/label': path.resolve(__dirname, 'src/components/ui/label.tsx'),
      '@/components/ui/skeleton': path.resolve(__dirname, 'src/components/ui/skeleton.tsx'),
    };
    return config;
  },
  transpilePackages: ['next-themes'],
  experimental: {
    esmExternals: 'loose',
  },
  images: {
    unoptimized: true,
  },
};