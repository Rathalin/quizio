/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['page.tsx', 'page.ts'],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'go.quizio.flockert.at',
        pathname: '/uploads',
      },
    ],
  },
};

export default nextConfig;
