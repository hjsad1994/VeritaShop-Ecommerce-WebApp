/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');

const DEFAULT_IMAGE_HOSTS = [
  'd1ffmiafbbgufv.cloudfront.net',
  'dqwxtopaa87nn.cloudfront.net',
  '*.s3.amazonaws.com',
  '*.s3.ap-southeast-1.amazonaws.com',
  '*.s3.us-east-1.amazonaws.com',
];

/**
 * Convert comma-separated env values (or default list) into Next remotePatterns.
 * Supports entries like `assets.example.com` or full URLs such as `https://cdn.example.com`.
 */
const toRemotePatterns = () => {
  const rawHosts = process.env.NEXT_PUBLIC_IMAGE_HOSTS
    ? process.env.NEXT_PUBLIC_IMAGE_HOSTS.split(',').map((host) => host.trim()).filter(Boolean)
    : DEFAULT_IMAGE_HOSTS;

  return rawHosts.map((host) => {
    if (host.includes('://')) {
      const url = new URL(host);
      return {
        protocol: url.protocol.replace(':', ''),
        hostname: url.hostname,
      };
    }

    return {
      protocol: 'https',
      hostname: host,
    };
  });
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
  images: {
    remotePatterns: toRemotePatterns(),
  },
  // Set output file tracing root to frontend directory to avoid lockfile detection issues
  outputFileTracingRoot: path.resolve(__dirname),
};

module.exports = nextConfig;
