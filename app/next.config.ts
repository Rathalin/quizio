import { NextConfig } from 'next';
import pkg from './package.json';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
  pageExtensions: ['page.tsx', 'page.ts'],
  reactStrictMode: true,
  reactCompiler: true,
  typedRoutes: true,
  i18n: {
    locales: ['de', 'en'],
    defaultLocale: 'de',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'go.quizio.flockert.at',
        pathname: '/uploads',
      },
    ],
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
    typedEnv: true,
  },
};

export default nextConfig;
