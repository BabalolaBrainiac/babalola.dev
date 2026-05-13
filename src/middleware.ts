import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function handleSubdomainRouting(req: NextRequest): NextResponse | null {
  const hostname = req.headers.get('host') || ''
  const pathname = req.nextUrl.pathname

  // learning subdomain
  const isLearningSubdomain = hostname.includes('learning.localhost') || hostname.includes('learning.babalola.dev')
  if (isLearningSubdomain) {
    if (!pathname.startsWith('/learning') && !pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.startsWith('/auth')) {
      const url = req.nextUrl.clone()
      url.pathname = pathname === '/' ? '/learning' : `/learning${pathname}`
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

  // uploads subdomain - rewrite to /uploads/* and bypass auth
  const isUploadsSubdomain = hostname.includes('uploads.localhost') || hostname.includes('uploads.babalola.dev')
  if (isUploadsSubdomain) {
    if (!pathname.startsWith('/uploads') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      const url = req.nextUrl.clone()
      url.pathname = pathname === '/' ? '/uploads' : `/uploads${pathname}`
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

  // check if we're on jobs subdomain
  const isJobsSubdomain = hostname.includes('jobs.localhost') || hostname.includes('jobs.babalola.dev')

  if (isJobsSubdomain) {
    if (pathname === '/') {
      const url = req.nextUrl.clone()
      url.pathname = '/jobs'
      return NextResponse.rewrite(url)
    }
  }

  // check if we're on blog subdomain (handle with or without port)
  const isBlogSubdomain = hostname.includes('blog.localhost') || hostname.includes('blog.babalola.dev')
  
  if (isBlogSubdomain) {
    // rewrite root to blog page
    if (pathname === '/') {
      const url = req.nextUrl.clone()
      url.pathname = '/blog'
      return NextResponse.rewrite(url)
    }
    
    // rewrite /create to /blog/create
    if (pathname === '/create') {
      const url = req.nextUrl.clone()
      url.pathname = '/blog/create'
      return NextResponse.rewrite(url)
    }
    
    // rewrite /:slug to /blog/:slug (but not if it's already /blog/*)
    if (!pathname.startsWith('/blog') && !pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.startsWith('/admin') && pathname !== '/manifest.json') {
      // check if it's an edit route
      if (pathname.endsWith('/edit')) {
        const slug = pathname.replace('/edit', '')
        const url = req.nextUrl.clone()
        url.pathname = `/blog${slug}/edit`
        return NextResponse.rewrite(url)
      }
      // regular slug route
      const url = req.nextUrl.clone()
      url.pathname = `/blog${pathname}`
      return NextResponse.rewrite(url)
    }
  }
  
  return null
}

export default withAuth(
  function middleware(req) {
    const hostname = req.headers.get('host') || ''
    const pathname = req.nextUrl.pathname
    const isBlogSubdomain = hostname.includes('blog.localhost') || hostname.includes('blog.babalola.dev')
    
    // handle subdomain routing first
    const subdomainResponse = handleSubdomainRouting(req)
    if (subdomainResponse) {
      return subdomainResponse
    }
    
    // if on blog subdomain and trying to access auth routes, redirect to main domain
    if (isBlogSubdomain && pathname.startsWith('/auth')) {
      const mainDomain = hostname.replace(/^blog\./, '')
      const url = req.nextUrl.clone()
      url.host = mainDomain
      return NextResponse.redirect(url)
    }
    
    // handle redirect to sign-in from blog subdomain
    const url = req.nextUrl
    if (isBlogSubdomain && url.searchParams.get('callbackUrl')?.includes('/auth/signin')) {
      const mainDomain = hostname.replace(/^blog\./, '')
      const protocol = url.protocol
      const callbackUrl = pathname + url.search
      return NextResponse.redirect(`${protocol}//${mainDomain}/auth/signin${callbackUrl}`)
    }
    
    // additional middleware logic can go here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        const hostname = req.headers.get('host') || ''

        // uploads subdomain uses its own TOTP auth - never require NextAuth session
        const isUploadsSubdomain = hostname.includes('uploads.localhost') || hostname.includes('uploads.babalola.dev')
        if (isUploadsSubdomain || pathname.startsWith('/uploads')) {
          return true
        }

        // protect blog creation and editing routes (handle both /create and /blog/create)
        const isCreateRoute = pathname === '/create' || pathname.startsWith('/blog/create')
        const isEditRoute = pathname.includes('/edit')

        if (isCreateRoute || isEditRoute) {
          return token?.role === 'admin' || token?.role === 'contributor'
        }

        // protect admin routes
        if (pathname.startsWith('/admin') || pathname.startsWith('/brainiac')) {
          return token?.role === 'admin'
        }

        if (pathname.startsWith('/learning')) {
          if (pathname === '/learning' || pathname === '/learning/') {
            return true
          }
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * match all request paths except for the ones starting with:
     * - api (api routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (manifest file)
     * - logo.svg, og-image.jpg (other static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|logo.svg|og-image.jpg|opengraph-image).*)',
  ]
}
