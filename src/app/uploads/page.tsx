'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadsPage() {
  const [token, setToken]       = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/uploads/verify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token: token.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Verification failed')
        return
      }

      router.push(`/uploads/upload?project=${encodeURIComponent(data.project)}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white">Secure Upload</h1>
          <p className="mt-2 text-sm text-gray-400">Enter the access token you received to upload files.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="mb-1.5 block text-sm font-medium text-gray-300">
              Access Token
            </label>
            <input
              id="token"
              type="text"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-center font-mono text-lg tracking-widest text-white placeholder-gray-600 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="w-full rounded-lg bg-white px-4 py-3 font-medium text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Access Upload Page'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-600">
          Tokens expire after 24 hours or one successful upload session.
        </p>
      </div>
    </div>
  )
}
