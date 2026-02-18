'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: 'contributor'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userExists, setUserExists] = useState<boolean | null>(null)
  const router = useRouter()

  // Check if user already exists on mount
  useEffect(() => {
    const checkUserExists = async () => {
      try {
        const response = await fetch('/api/auth/check-user')
        const data = await response.json()
        setUserExists(data.exists)
      } catch (error) {
        console.error('Failed to check user status')
      }
    }
    checkUserExists()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          role: formData.role
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setSuccess('User created successfully! You can now sign in.')
      setUserExists(true)
      setFormData({
        email: '',
        name: '',
        password: '',
        confirmPassword: '',
        role: 'contributor'
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Show closed message if user exists
  if (userExists === true) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-all duration-300 ease-out flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="glass-card p-8 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold font-mono gradient-text mb-4">
              Registration Closed
            </h1>
            <p className="text-[var(--muted)] mb-6">
              User account already exists. Registration is disabled.
            </p>
            <div className="space-y-3">
              <Link href="/auth/signin" className="block w-full btn btn-primary">
                Sign In
              </Link>
              <Link href="/blog" className="block text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
                ← Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-all duration-300 ease-out flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-mono gradient-text mb-2">
              Register User
            </h1>
            <p className="text-[var(--muted)]">
              Create admin account (one-time only)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 glass rounded-lg border border-red-500">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 glass rounded-lg border border-green-500">
                <p className="text-green-500 text-sm">{success}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none"
                placeholder="Enter your password (min 6 characters)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none"
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary"
            >
              {isLoading ? 'Creating User...' : 'Create User'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link href="/auth/signin" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
              Already have an account? Sign In
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
