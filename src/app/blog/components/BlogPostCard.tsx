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
  const [isDeleting, setIsDeleting]         = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const canEdit   = session?.user?.role === 'admin' ||
                    (session?.user?.role === 'contributor' && session?.user?.id === post.author_id)
  const canDelete = session?.user?.role === 'admin'

  const handleDelete = async () => {
    if (!canDelete) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/blog/${post.slug}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete post')
      if (onDelete) onDelete()
      router.push('/blog')
    } catch (e) {
      console.error('Error deleting post:', e)
      alert('Failed to delete post.')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      <article className="relative group border border-[#1e1e1e] bg-[#111111] hover:border-[#e8a000] transition-colors duration-150 flex flex-col h-full">
        <Link href={`/blog/${post.slug}`} className="flex-1 p-6 block space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-[#e8a000] uppercase tracking-[0.2em]">
              {post.tags?.[0] || 'Engineering'}
            </span>
            {!post.published && (
              <span className="px-1.5 py-0.5 text-[8px] font-bold font-mono border border-yellow-700/40 text-yellow-600 uppercase tracking-widest">
                Draft
              </span>
            )}
          </div>

          <h3 className="text-sm font-bold text-[#d4d0c8] group-hover:text-[#e8a000] transition-colors leading-snug line-clamp-2">
            {post.title}
          </h3>

          <p className="text-xs text-[#666666] line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        </Link>

        <div className="px-6 py-4 border-t border-[#1e1e1e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border border-[#2a2a2a] flex items-center justify-center text-[9px] font-bold text-[#e8a000]">
              BO
            </div>
            <span className="text-[10px] font-mono text-[#444444]">
              {new Date(post.created_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShareButton title={post.title} slug={post.slug} className="opacity-40 hover:opacity-100 transition-opacity" />
            <span className="text-xs text-[#3a3a3a] group-hover:text-[#e8a000] transition-colors">→</span>
          </div>
        </div>

        {(canEdit || canDelete) && (
          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {canEdit && (
              <Link
                href={`/blog/${post.slug}/edit`}
                className="p-1.5 border border-[#2a2a2a] bg-[#0a0a0a] text-[#888888] hover:text-[#e8a000] hover:border-[#e8a000] transition-colors text-[10px]"
              >
                edit
              </Link>
            )}
            {canDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 border border-[#2a2a2a] bg-[#0a0a0a] text-[#888888] hover:text-red-400 hover:border-red-500/30 transition-colors text-[10px]"
              >
                del
              </button>
            )}
          </div>
        )}
      </article>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-[#0a0a0a]/90 flex items-center justify-center z-50 p-6">
          <div className="border border-red-500/30 bg-[#111111] p-8 max-w-sm w-full font-mono">
            <p className="text-[10px] text-[#e8a000] uppercase tracking-widest mb-3">// confirm delete</p>
            <h3 className="text-base font-bold text-red-400 mb-2">Delete post?</h3>
            <p className="text-xs text-[#888888] mb-8 leading-relaxed">
              Permanently remove &quot;{post.title}&quot;. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2 bg-red-500 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'deleting...' : 'confirm'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 border border-[#2a2a2a] text-[#888888] text-[10px] uppercase tracking-widest hover:border-[#e8a000] hover:text-[#e8a000] transition-colors"
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
