import path from 'node:path'
import type { NextConfig } from 'next'

// Monorepo root: dependencies are installed there, once for all showcases.
const monorepoRoot = path.join(__dirname, '../..')

const nextConfig: NextConfig = {
  output: 'standalone',
  // The shared kit is TypeScript source, compiled with each application.
  transpilePackages: ['@eddb/showcase-kit'],
  outputFileTracingRoot: monorepoRoot,
  turbopack: { root: monorepoRoot },
  // Mount point, fixed at build time: empty for a domain of its own
  // (pressearchiv.unifr.ch), e.g. "/pressearchiv" under eddb.unifr.ch.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  images: { unoptimized: true },
}

export default nextConfig
