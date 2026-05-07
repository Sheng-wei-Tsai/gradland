import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ── Image optimisation ──────────────────────────────────────────────────────
  // Removed `unoptimized: true` — Next.js now handles WebP conversion, resizing,
  // and lazy loading. Remote hostnames must be explicitly allowed.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: '*.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // YouTube thumbnails (channel video grid + video pages)
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: '*.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      // Company logos — 3-tier chain: Simple Icons → Logo.dev → Google favicons
      { protocol: 'https', hostname: 'cdn.simpleicons.org' },
      { protocol: 'https', hostname: 'img.logo.dev' },
      { protocol: 'https', hostname: 'www.google.com', pathname: '/s2/**' },
    ],
  },

  // ── Security headers ────────────────────────────────────────────────────────
  // CSP is handled by proxy.ts (per-request nonce generation).
  // Only static, non-nonce headers live here.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options',        value: 'DENY' },
          // Stop MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer leak control
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
          // Disable unnecessary browser features
          { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
