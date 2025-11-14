'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { BlogPost } from '@/lib/supabase'
import MarkdownRenderer from '../components/MarkdownRenderer'
import ShareButton from '../components/ShareButton'

interface BlogPostClientProps {
  post: BlogPost
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const canEdit = session?.user?.role === 'admin' || 
                  (session?.user?.role === 'contributor' && session?.user?.id === post?.author_id)
  const canDelete = session?.user?.role === 'admin'

  const handleDelete = async () => {
    if (!canDelete || !post) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/blog/${post.slug}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete post')
      }
      
          // Redirect to blog page
          router.push('/blog')
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-all duration-300 ease-out">
      {/* Header */}
      <header className="border-b border-[var(--glass-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
              <div className="flex justify-between items-center">
              <Link href="/blog" prefetch={true} className="btn btn-secondary">
                ← Back to brainiac's blog
              </Link>
                <div className="flex items-center gap-4">
                  <ShareButton title={post.title} slug={post.slug} />
                  {canEdit && (
                    <Link
                      href={`/blog/${post.slug}/edit`}
                      className="btn btn-primary"
                    >
                      Edit Post
                    </Link>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeleting}
                      className="btn bg-red-500 hover:bg-red-600 text-white"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Post'}
                    </button>
                  )}
                  <div className="text-sm text-[var(--muted)]">
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
        </div>
      </header>

      {/* Post Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="glass-card p-8">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-mono gradient-text mb-4">
              {post.title}
            </h1>
            
            {/* Post Meta Information */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-[var(--muted)]">
              <div className="flex items-center gap-2">
                <span className="font-mono">📅</span>
                <span>{new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              
              {post.reading_time && (
                <div className="flex items-center gap-2">
                  <span className="font-mono">⏱️</span>
                  <span>{post.reading_time} min read</span>
                </div>
              )}
              
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm font-mono glass rounded-full"
                  style={{ color: 'var(--accent)' }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            {post.prerequisites && post.prerequisites.length > 0 && (
              <div className="mb-6 p-4 glass rounded-lg border border-[var(--glass-border)]">
                <h3 className="text-sm font-mono font-semibold mb-2 gradient-text">
                  📚 Prerequisites
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  {Array.isArray(post.prerequisites) ? post.prerequisites.join(', ') : post.prerequisites}
                </p>
              </div>
            )}
          </header>

          <div className="prose prose-lg max-w-none">
            <MarkdownRenderer content={post.content} />
          </div>
        </div>
      </article>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold font-mono mb-4 text-red-400">
              Delete Post
            </h3>
            <p className="text-[var(--muted)] mb-6">
              Are you sure you want to delete "{post.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn bg-red-500 hover:bg-red-600 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
