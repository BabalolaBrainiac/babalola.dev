/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic performance optimizations
  compress: true,
  poweredByHeader: false,

  // SEO and Performance optimizations
  experimental: {
    optimizeCss: true,
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
    // Only apply redirects in production
    const isProduction = process.env.NODE_ENV === 'production' && 
                        process.env.VERCEL_ENV === 'production'
    
    if (isProduction) {
      return [
        // Redirect /blog on main domain to blog subdomain
        {
          source: '/blog',
          destination: 'https://blog.babalola.dev',
          permanent: true,
        },
        {
          source: '/blog/:path*',
          destination: 'https://blog.babalola.dev/:path*',
          permanent: true,
        },
      ]
    }
    return []
  },

  // Security headers with SEO considerations
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
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
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
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