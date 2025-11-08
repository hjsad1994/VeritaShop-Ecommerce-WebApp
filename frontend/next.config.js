/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration for Windows compatibility
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
