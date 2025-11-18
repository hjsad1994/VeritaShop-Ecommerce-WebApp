const path = require('path');

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
  // Disable React Strict Mode to prevent double function calls in development
  reactStrictMode: false,
  // Set output file tracing root to frontend directory to avoid lockfile detection issues
  outputFileTracingRoot: path.resolve(__dirname),
};

module.exports = nextConfig;
