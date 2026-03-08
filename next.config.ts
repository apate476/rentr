import type { NextConfig } from 'next'

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js requires unsafe-inline for styles; Tailwind v4 uses inline styles
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Scripts: self + Cloudflare Turnstile + Google Maps + Mapbox
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://maps.googleapis.com https://api.mapbox.com",
      // Images: self + Supabase storage + Mapbox + Google Maps + data URIs
      "img-src 'self' data: blob: https://*.supabase.co https://api.mapbox.com https://*.mapbox.com https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com https://*.gstatic.com",
      // API connections
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://events.mapbox.com https://places.googleapis.com https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com https://*.gstatic.com https://challenges.cloudflare.com",
      // Cloudflare Turnstile iframe
      'frame-src https://challenges.cloudflare.com',
      // Workers (Mapbox GL uses web workers)
      'worker-src blob:',
    ]
      .join('; ')
      .trim(),
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Silence noisy build output for cleaner CI logs
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
}

export default nextConfig
