'use client'

import { useState, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SignInForm() {
  const [mode, setMode] = useState<'signin' | 'request'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [requestEmail, setRequestEmail] = useState('')
  const [requestName, setRequestName] = useState('')
  const [requestSent, setRequestSent] = useState(false)
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestError, setRequestError] = useState('')
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
        const session = await getSession()
        const role = session?.user?.role
        const wantsLearning = callbackUrl.startsWith('/learning')

        if (role === 'admin') {
          if (callbackUrl.includes('/admin') || callbackUrl.includes('/create')) {
            isFullUrl ? (window.location.href = callbackUrl) : router.push(callbackUrl)
          } else {
            router.push('/admin')
          }
        } else if (role === 'learner') {
          const dest = wantsLearning ? callbackUrl : '/learning'
          isFullUrl ? (window.location.href = callbackUrl) : router.push(dest)
        } else if (role === 'contributor') {
          // wantsLearning covers learners stored as contributor (pre-migration fallback)
          // Real contributors land here from /create or /blog callbackUrls
          if (wantsLearning) {
            router.push(callbackUrl)
          } else {
            isFullUrl ? (window.location.href = callbackUrl) : router.push(callbackUrl)
          }
        } else {
          setError('You do not have permission to access this area')
        }
      }
    } catch {
      setError('An error occurred during sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    setRequestLoading(true)
    setRequestError('')

    try {
      const res = await fetch('/api/auth/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: requestEmail, name: requestName }),
      })
      const data = await res.json()

      if (!res.ok) {
        setRequestError(data.error ?? 'Something went wrong')
      } else {
        setRequestSent(true)
      }
    } catch {
      setRequestError('Something went wrong')
    } finally {
      setRequestLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-all duration-300 ease-out flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-mono gradient-text mb-2">
              {mode === 'signin' ? 'Sign In' : 'Get Access'}
            </h1>
            <p className="text-[var(--muted)]">
              {mode === 'signin'
                ? 'Access your learning workspace or editorial tools'
                : 'Request learner credentials by email'}
            </p>
          </div>

          <div className="mb-6 flex rounded-lg border border-[var(--glass-border)] bg-[var(--background-secondary)] p-1">
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setRequestError('')
              }}
              className={`flex-1 rounded-md px-3 py-2 text-sm transition-colors ${mode === 'signin' ? 'bg-[var(--accent)] text-black' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('request')
                setError('')
              }}
              className={`flex-1 rounded-md px-3 py-2 text-sm transition-colors ${mode === 'request' ? 'bg-[var(--accent)] text-black' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
            >
              Get Access
            </button>
          </div>

          {mode === 'signin' ? (
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
          ) : requestSent ? (
            <div className="space-y-4">
              <div className="p-4 glass rounded-lg border border-green-500">
                <p className="text-sm text-green-400">Check your inbox at {requestEmail}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">We sent your login credentials. Come back to this page to sign in.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setRequestSent(false)
                }}
                className="w-full btn btn-secondary"
              >
                ← Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleRequestAccess} className="space-y-6">
              {requestError && (
                <div className="p-4 glass rounded-lg border border-red-500">
                  <p className="text-red-500 text-sm">{requestError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none"
                  placeholder="Optional display name"
                />
              </div>

              <div>
                <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={requestLoading}
                className="w-full btn btn-primary"
              >
                {requestLoading ? 'Requesting...' : 'Email my access'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center space-y-2">
            <Link href="/blog" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
              ← Back to site
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
