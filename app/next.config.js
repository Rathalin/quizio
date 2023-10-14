/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['page.tsx', 'page.ts'],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'quizio.flockert.at',
        port: '',
        pathname: '/uploads',
      },
    ],
  },
};

module.exports = nextConfig;
