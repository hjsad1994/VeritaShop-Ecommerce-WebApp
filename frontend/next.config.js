/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration for Windows compatibility
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable experimental trace to fix EPERM error on Windows
  experimental: {
    disableOptimizedLoading: true,
  },
};

module.exports = nextConfig;
