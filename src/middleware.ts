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
    if (!pathname.startsWith('/blog') && !pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.startsWith('/admin')) {
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
    // handle subdomain routing first
    const subdomainResponse = handleSubdomainRouting(req)
    if (subdomainResponse) {
      return subdomainResponse
    }
    
    // additional middleware logic can go here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // protect blog creation and editing routes
        if (req.nextUrl.pathname.startsWith('/blog/create') || 
            req.nextUrl.pathname.includes('/edit')) {
          return token?.role === 'admin' || token?.role === 'contributor'
        }
        
        // protect admin routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'admin'
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
