/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['page.tsx', 'page.ts'],
  reactStrictMode: true,
  // experimental: {
  //   modularizeImports: {
  //     '@mui/material': {
  //       transform: '@mui/material/{{member}}',
  //     },
  //     '@mui/icons-material': {
  //       transform: '@mui/icons-material/{{member}}',
  //     },
  //   },
  // },
};

module.exports = nextConfig;
