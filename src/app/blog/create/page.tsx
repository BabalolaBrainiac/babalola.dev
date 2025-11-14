'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CreateBlogPost } from '@/lib/supabase'
import BlogEditor from '../components/BlogEditor'

export default function CreatePostPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'contributor')) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  const handleSave = async (post: CreateBlogPost) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      })

      if (!response.ok) {
        throw new Error('Failed to create post')
      }

      const createdPost = await response.json()
      router.push(`/${createdPost.slug}`)
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Error creating post')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-all duration-300 ease-out">
      {/* Header */}
      <header className="border-b border-[var(--glass-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold font-mono gradient-text">Create New Post</h1>
              <p className="text-[var(--muted)] mt-2">Share your thoughts with the world</p>
            </div>
            <button
              onClick={handleCancel}
              className="btn btn-secondary"
            >
              ← Back to Blog
            </button>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="py-8">
        <BlogEditor
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </main>
    </div>
  )
}
