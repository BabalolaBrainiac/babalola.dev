'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BlogPost } from '@/lib/supabase'
import ShareButton from './ShareButton'

interface BlogPostCardProps {
  post: BlogPost
  onDelete?: () => void
}

export default function BlogPostCard({ post, onDelete }: BlogPostCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const canEdit = session?.user?.role === 'admin' || 
                  (session?.user?.role === 'contributor' && session?.user?.id === post.author_id)
  const canDelete = session?.user?.role === 'admin'

  const handleDelete = async () => {
    if (!canDelete) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/blog/${post.slug}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete post')
      }
      
      // Call the onDelete callback to refresh the list
      if (onDelete) {
        onDelete()
      }
      
      // Redirect to blog page if we're on the individual post page
      router.push('/blog')
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Generate funky colors based on post title
  const getFunkyColor = (title: string) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500', 
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500',
      'from-teal-500 to-blue-500',
      'from-yellow-500 to-orange-500'
    ]
    const hash = title.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const funkyGradient = getFunkyColor(post.title)

  return (
    <>
      <article className="group glass-card p-6 hover:scale-105 hover:rotate-1 transition-all duration-300 relative overflow-hidden">
        {/* Funky background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${funkyGradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
        
        {/* Floating particles effect */}
        <div className="absolute top-2 left-2 w-2 h-2 bg-[var(--accent)] rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-4 right-8 w-1 h-1 bg-[var(--accent)] rounded-full opacity-40 animate-pulse delay-100"></div>
        <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-[var(--accent)] rounded-full opacity-20 animate-pulse delay-200"></div>

        {(canEdit || canDelete) && (
          <div className="absolute top-3 right-3 flex flex-col gap-2 min-w-[70px] z-10">
            {canEdit && (
              <Link
                href={`/blog/${post.slug}/edit`}
                className="text-xs px-2 py-1 glass rounded-full hover:bg-[var(--accent)] transition-all duration-200 text-center hover:scale-110 whitespace-nowrap"
                style={{ color: 'var(--muted)' }}
              >
                ✏️ Edit
              </Link>
            )}
            {canDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="text-xs px-2 py-1 glass rounded-full hover:bg-red-500 transition-all duration-200 text-red-400 hover:text-white text-center hover:scale-110 whitespace-nowrap"
              >
                {isDeleting ? '🗑️ Deleting...' : '🗑️ Delete'}
              </button>
            )}
          </div>
        )}
      
        <div className="mb-4 pr-32 relative z-5">
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/blog/${post.slug}`} prefetch={true} className="group/link">
              <h2 className="text-xl font-bold font-mono gradient-text hover:text-[var(--accent)] transition-all duration-300 group-hover/link:scale-105">
                {post.title}
              </h2>
            </Link>
            {!post.published && (
              <span className="px-2 py-1 text-xs font-mono glass rounded-full bg-yellow-500 text-black animate-pulse">
                📝 Draft
              </span>
            )}
          </div>
          
          {/* Funky date with icon */}
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <span className="text-[var(--accent)]">📅</span>
            <span>
              {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
        
        {/* Excerpt with funky styling */}
        <div className="relative mb-4">
          <p className="text-[var(--muted)] leading-relaxed group-hover:text-[var(--foreground)] transition-colors duration-300">
            {post.excerpt}
          </p>
          {/* Decorative line */}
          <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-[var(--accent)] to-transparent transition-all duration-500 mt-2"></div>
        </div>
        
        {/* Funky tags */}
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag, index) => (
            <span
              key={tag}
              className="px-3 py-1 text-xs font-mono glass rounded-full hover:scale-110 transition-all duration-200 hover:bg-[var(--accent)] hover:text-white cursor-default"
              style={{ 
                color: 'var(--accent)',
                animationDelay: `${index * 100}ms`
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Funky read more indicator and share button */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors duration-300">
            <span>👀</span>
            <span>Click to read more</span>
          </div>
          <div className="flex items-center gap-3">
            <ShareButton title={post.title} slug={post.slug} className="scale-75" />
            <div className="text-[var(--accent)] group-hover:translate-x-1 transition-transform duration-300">
              →
            </div>
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
    </>
  )
}
