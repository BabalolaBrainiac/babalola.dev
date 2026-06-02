const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "worker-src 'self' blob:",
      "connect-src 'self' https://*.supabase.co https://*.cloudflare.com https://*.r2.cloudflarestorage.com https://cdn.babalola.dev",
      "media-src 'self' blob: https:",
      'upgrade-insecure-requests',
    ].join('; '),
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
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=()',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic performance optimizations
  compress: true,
  poweredByHeader: false,

  // SEO and Performance optimizations
  experimental: {
    optimizeCss: true,
  },

  // Fix Supabase realtime-js warnings
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.module = config.module || {}
      config.module.exprContextCritical = false
    }
    // Suppress critical dependency warnings for @supabase/realtime-js
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/realtime-js/ },
    ]
    return config
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Subdomain handling and redirects
  async rewrites() {
    const isProduction = process.env.NODE_ENV === 'production' &&
                        process.env.VERCEL_ENV === 'production'

    const rewrites = []

    // uploads subdomain routing (dev + prod)
    const uploadsSubdomain = isProduction ? 'uploads.babalola.dev' : 'uploads.localhost'
    rewrites.push(
      {
        source: '/',
        destination: '/uploads',
        has: [{ type: 'host', value: uploadsSubdomain }],
      },
      {
        source: '/upload',
        destination: '/uploads/upload',
        has: [{ type: 'host', value: uploadsSubdomain }],
      },
      {
        source: '/:path*',
        destination: '/uploads/:path*',
        has: [{ type: 'host', value: uploadsSubdomain }],
      }
    )

    // development subdomain routing for jobs.localhost
    if (!isProduction) {
      rewrites.push(
        {
          source: '/',
          destination: '/jobs',
          has: [
            {
              type: 'host',
              value: 'jobs.localhost',
            },
          ],
        }
      )
    }

    // production subdomain routing for jobs.babalola.dev
    if (isProduction) {
      rewrites.push(
        {
          source: '/',
          destination: '/jobs',
          has: [
            {
              type: 'host',
              value: 'jobs.babalola.dev',
            },
          ],
        }
      )
    }

    // development subdomain routing for blog.localhost
    if (!isProduction) {
      rewrites.push(
        {
          source: '/',
          destination: '/blog',
          has: [
            {
              type: 'host',
              value: 'blog.localhost',
            },
          ],
        },
        {
          source: '/create',
          destination: '/blog/create',
          has: [
            {
              type: 'host',
              value: 'blog.localhost',
            },
          ],
        },
        {
          source: '/admin/:path*',
          destination: '/admin/:path*',
          has: [
            {
              type: 'host',
              value: 'blog.localhost',
            },
          ],
        },
        {
          source: '/:slug',
          destination: '/blog/:slug',
          has: [
            {
              type: 'host',
              value: 'blog.localhost',
            },
          ],
        },
        {
          source: '/:slug/edit',
          destination: '/blog/:slug/edit',
          has: [
            {
              type: 'host',
              value: 'blog.localhost',
            },
          ],
        }
      );
    }
    
    // production subdomain routing for blog.babalola.dev
    if (isProduction) {
      rewrites.push(
        {
          source: '/',
          destination: '/blog',
          has: [
            {
              type: 'host',
              value: 'blog.babalola.dev',
            },
          ],
        },
        {
          source: '/create',
          destination: '/blog/create',
          has: [
            {
              type: 'host',
              value: 'blog.babalola.dev',
            },
          ],
        },
        {
          source: '/admin/:path*',
          destination: '/admin/:path*',
          has: [
            {
              type: 'host',
              value: 'blog.babalola.dev',
            },
          ],
        },
        {
          source: '/:slug',
          destination: '/blog/:slug',
          has: [
            {
              type: 'host',
              value: 'blog.babalola.dev',
            },
          ],
        },
        {
          source: '/:slug/edit',
          destination: '/blog/:slug/edit',
          has: [
            {
              type: 'host',
              value: 'blog.babalola.dev',
            },
          ],
        }
      );
    }
    
    return rewrites
  },

  async redirects() {
    const isProduction = process.env.NODE_ENV === 'production' && 
                        process.env.VERCEL_ENV === 'production'
    
    // only add redirects in production
    if (!isProduction) {
      return []
    }
    
    // production redirects to blog subdomain
    return [
      {
        source: '/blog',
        destination: 'https://blog.babalola.dev',
        permanent: true,
      },
      {
        source: '/blog/:path*',
        destination: 'https://blog.babalola.dev/:path*',
        permanent: true,
      }
    ]
  },

  // Security headers with SEO considerations
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Cache static assets for better performance
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/logo.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/og-image.jpg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
