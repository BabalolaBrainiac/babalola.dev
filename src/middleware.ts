import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function handleSubdomainRouting(req: NextRequest): NextResponse | null {
  const hostname = req.headers.get('host') || ''
  const pathname = req.nextUrl.pathname
  
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
    
    // additional middleware logic can go here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        const hostname = req.headers.get('host') || ''
        const isBlogSubdomain = hostname.includes('blog.localhost') || hostname.includes('blog.babalola.dev')
        
        // protect blog creation and editing routes (handle both /create and /blog/create)
        const isCreateRoute = pathname === '/create' || pathname.startsWith('/blog/create')
        const isEditRoute = pathname.includes('/edit')
        
        if (isCreateRoute || isEditRoute) {
          return token?.role === 'admin' || token?.role === 'contributor'
        }
        
        // protect admin routes
        if (pathname.startsWith('/admin')) {
          return token?.role === 'admin'
        }
        
        return true
      },
      async redirect({ url, baseUrl, req }) {
        const hostname = req.headers.get('host') || ''
        const isBlogSubdomain = hostname.includes('blog.localhost') || hostname.includes('blog.babalola.dev')
        
        // if redirecting to sign-in from blog subdomain, redirect to main domain
        if (isBlogSubdomain && url.includes('/auth/signin')) {
          const mainDomain = hostname.replace(/^blog\./, '')
          const protocol = req.nextUrl.protocol
          const callbackUrl = req.nextUrl.pathname + req.nextUrl.search
          return `${protocol}//${mainDomain}/auth/signin?callbackUrl=${encodeURIComponent(`${protocol}//${hostname}${callbackUrl}`)}`
        }
        
        return url
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
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|logo.svg|og-image.jpg).*)',
  ]
}
