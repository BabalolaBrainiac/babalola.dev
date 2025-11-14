'use client'

import { useState, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawCallbackUrl = searchParams.get('callbackUrl') || '/blog'
  
  // preserve the original callbackUrl if it's a full URL (for blog subdomain redirects)
  const isFullUrl = rawCallbackUrl.startsWith('http')
  const callbackUrl = rawCallbackUrl

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: callbackUrl,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        // Check if user is admin or contributor
        const session = await getSession()
        if (session?.user?.role === 'admin') {
          // if callbackUrl is /create or /admin, use it, otherwise go to /admin
          if (callbackUrl.includes('/admin') || callbackUrl.includes('/create')) {
            // if callbackUrl is absolute (from blog subdomain), redirect directly
            if (isFullUrl) {
              window.location.href = callbackUrl
            } else {
              router.push(callbackUrl)
            }
          } else {
            router.push('/admin')
          }
        } else if (session?.user?.role === 'contributor') {
          // preserve callbackUrl for contributors (could be /create)
          // if it's a full URL from blog subdomain, redirect directly
          if (isFullUrl) {
            window.location.href = callbackUrl
          } else {
            router.push(callbackUrl)
          }
        } else {
          setError('You do not have permission to access the blog')
        }
      }
    } catch (error) {
      setError('An error occurred during sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-all duration-300 ease-out flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-mono gradient-text mb-2">
              Sign In
            </h1>
            <p className="text-[var(--muted)]">
              Access brainiac's blog management
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 glass rounded-lg border border-red-500">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link href="/auth/register" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
              Don't have an account? Register
            </Link>
            <br />
            <Link href="/blog" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center">
        <div className="text-[var(--muted)]">Loading...</div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
