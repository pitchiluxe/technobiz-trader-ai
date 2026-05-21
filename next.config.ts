import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.coingecko.com' },
      { protocol: 'https', hostname: 'logos.covalenthq.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        ],
      },
    ]
  },
  webpack: (config) => {
    config.externals.push({ bufferutil: 'bufferutil', 'utf-8-validate': 'utf-8-validate' })
    // Resolve lightweight-charts to its existing CJS build (dist is missing production .mjs)
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string>),
      'lightweight-charts': path.resolve(
        __dirname,
        'node_modules/lightweight-charts/dist/lightweight-charts.development.cjs'
      ),
    }
    return config
  },
}

export default nextConfig
