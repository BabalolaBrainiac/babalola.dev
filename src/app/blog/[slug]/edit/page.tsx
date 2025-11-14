'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BlogPost } from '@/lib/supabase'
import BlogEditor from '../../components/BlogEditor'

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'contributor')) {
      router.push('/auth/signin')
      return
    }

    if (params.slug) {
      fetchPost(params.slug as string)
    }
  }, [params.slug, session, status, router])

  const fetchPost = async (slug: string) => {
    try {
      const response = await fetch(`/api/blog/${slug}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('Post not found')
        } else {
          throw new Error('Failed to fetch post')
        }
        return
      }
      const data = await response.json()
      setPost(data)
    } catch (error) {
      setError('Failed to load blog post')
      console.error('Error fetching post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (updatedPost: any) => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/blog/${params.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPost),
      })

      if (!response.ok) {
        throw new Error('Failed to update post')
      }

      const updated = await response.json()
      router.push(`/blog/${updated.slug}`)
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Error updating post')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push(`/blog/${params.slug}`)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] transition-all duration-300 ease-out">
        <div className="animate-pulse text-[var(--muted)]">Loading...</div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] transition-all duration-300 ease-out">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error || 'Post not found'}</div>
          <button 
            onClick={() => router.push('/blog')}
            className="btn btn-primary"
          >
            ← Back to Blog
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-all duration-300 ease-out">
      {/* Header */}
      <header className="border-b border-[var(--glass-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold font-mono gradient-text">Edit Post</h1>
              <p className="text-[var(--muted)] mt-2">Update your blog post</p>
            </div>
            <button
              onClick={handleCancel}
              className="btn btn-secondary"
            >
              ← Back to Post
            </button>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="py-8">
        <BlogEditor
          initialPost={post}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </main>
    </div>
  )
}
