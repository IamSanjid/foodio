import type { NextConfig } from 'next';

const publicApiUrl = new URL(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
);

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol:
          publicApiUrl.protocol.toLowerCase() === 'https' ? 'https' : 'http',
        hostname: publicApiUrl.hostname,
        port: publicApiUrl.port,
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
