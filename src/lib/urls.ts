/**
 * URL utility functions for determining correct URLs based on environment
 * Centralized to avoid duplication and ensure consistency
 */

export function getBlogUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const port = window.location.port || '3000'
    const protocol = window.location.protocol
    
    const isLocalhost = hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname.startsWith('192.168.') || 
      hostname.startsWith('10.') || 
      hostname.startsWith('172.') ||
      hostname.includes('.local')
    
    const isProduction = hostname === 'babalola.dev' || 
      hostname === 'www.babalola.dev' || 
      hostname.endsWith('.babalola.dev')
    
    if (isLocalhost) {
      return `${protocol}//blog.localhost:${port}`
    }
    
    if (isProduction) {
      return 'https://blog.babalola.dev'
    }
    
    return `${protocol}//blog.localhost:${port}`
  }
  
  return process.env.NODE_ENV === 'production' 
    ? 'https://blog.babalola.dev' 
    : 'http://blog.localhost:3000'
}

export function getPortfolioUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const port = window.location.port || '3000'
    const protocol = window.location.protocol
    
    const isLocalhost = hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname.startsWith('192.168.') || 
      hostname.startsWith('10.') || 
      hostname.startsWith('172.') ||
      hostname.includes('.local') ||
      hostname.includes('blog.localhost')
    
    const isProduction = hostname === 'babalola.dev' || 
      hostname === 'www.babalola.dev' || 
      hostname.endsWith('.babalola.dev')
    
    if (isLocalhost) {
      return `${protocol}//localhost:${port}`
    }
    
    if (isProduction) {
      return 'https://babalola.dev'
    }
    
    return `${protocol}//localhost:${port}`
  }
  
  return process.env.NODE_ENV === 'production' 
    ? 'https://babalola.dev' 
    : 'http://localhost:3000'
}

