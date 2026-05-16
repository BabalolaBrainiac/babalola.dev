'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { BlogPost } from '@/lib/supabase'
import MarkdownRenderer from '../components/MarkdownRenderer'
import ShareButton from '../components/ShareButton'
import { motion, useScroll, useSpring } from 'framer-motion'

interface BlogPostClientProps {
  post: BlogPost
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isDeleting,        setIsDeleting]        = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [headings,          setHeadings]          = useState<{ id: string; text: string; level: number }[]>([])

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const extracted: { id: string; text: string; level: number }[] = []
    let match
    while ((match = headingRegex.exec(post.content)) !== null) {
      const text = match[2]
      const id   = text.toLowerCase().replace(/[^\w]+/g, '-')
      extracted.push({ id, text, level: match[1].length })
    }
    setHeadings(extracted)
  }, [post.content])

  const canEdit   = session?.user?.role === 'admin' ||
                    (session?.user?.role === 'contributor' && session?.user?.id === post?.author_id)
  const canDelete = session?.user?.role === 'admin'

  const readTime = Math.max(1, Math.ceil((post.content?.length || 0) / 1200))

  const handleDelete = async () => {
    if (!canDelete || !post) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/blog/${post.slug}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete post')
      router.push('/blog')
    } catch (e) {
      console.error(e)
      alert('Failed to delete post.')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4d0c8] font-mono">

      {/* Reading progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#e8a000] z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Header */}
      <header className="border-b border-[#1e1e1e] bg-[#0a0a0a] sticky top-0 z-40 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 w-full overflow-hidden">
          <Link
            href="/blog"
            className="text-[8px] sm:text-[10px] text-[#888888] hover:text-[#e8a000] transition-colors uppercase tracking-widest whitespace-nowrap"
          >
            ← blog
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ShareButton title={post.title} slug={post.slug} />
            {canEdit && (
              <Link
                href={`/blog/${post.slug}/edit`}
                className="btn btn-primary"
              >
                edit
              </Link>
            )}
            {canDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn btn-ghost border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
              >
                delete
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 lg:py-24 grid lg:grid-cols-12 gap-8 lg:gap-12 w-full overflow-hidden">

        {/* TOC sidebar */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 h-fit space-y-8 overflow-hidden">
          {headings.length > 0 && (
            <div>
              <p className="text-[10px] text-[#e8a000] uppercase tracking-widest mb-4">
                // contents
              </p>
              <nav className="space-y-2">
                {headings.map(h => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={`block text-[11px] text-[#555555] hover:text-[#e8a000] transition-colors leading-relaxed ${
                      h.level > 1 ? 'pl-3 border-l border-[#1e1e1e]' : ''
                    }`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          )}

          <div className="border-t border-[#1e1e1e] pt-6">
            <p className="text-[10px] text-[#3a3a3a] uppercase tracking-widest mb-3">author</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border border-[#2a2a2a] flex items-center justify-center text-[10px] font-bold text-[#e8a000]">
                BO
              </div>
              <div>
                <p className="text-xs text-[#d4d0c8] font-semibold">Brainiac</p>
                <p className="text-[10px] text-[#444444]">Senior Engineer</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Article */}
        <article className="lg:col-span-7 space-y-6 sm:space-y-10 w-full overflow-hidden">
          {/* Meta */}
          <header className="space-y-3 sm:space-y-4 w-full overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] text-[#444444] uppercase tracking-widest break-words">
              <span className="text-[#e8a000]">{post.tags?.[0] || 'Engineering'}</span>
              <span className="hidden sm:inline">·</span>
              <span className="break-words">{new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className="hidden sm:inline">·</span>
              <span>{readTime} min read</span>
            </div>

            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-[#d4d0c8] leading-tight break-words w-full">
              {post.title}
            </h1>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-1">
                {post.tags.map(t => (
                  <span
                    key={t}
                    className="text-[8px] sm:text-[9px] border border-[#2a2a2a] px-1.5 sm:px-2 py-0.5 text-[#555555] uppercase tracking-widest break-words"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <div className="prose prose-invert max-w-none w-full overflow-hidden
            prose-p:text-[#888888] prose-p:leading-relaxed prose-p:text-xs sm:prose-p:text-sm prose-p:break-words
            prose-h1:text-[#d4d0c8] prose-h2:text-[#d4d0c8] prose-h3:text-[#d4d0c8]
            prose-h1:text-xl sm:prose-h1:text-2xl prose-h1:break-words
            prose-h2:text-lg sm:prose-h2:text-xl prose-h2:break-words prose-h2:border-b prose-h2:border-[#1e1e1e] prose-h2:pb-2
            prose-h3:text-base sm:prose-h3:text-lg prose-h3:break-words
            prose-a:text-[#e8a000] prose-a:no-underline hover:prose-a:underline prose-a:break-words
            prose-strong:text-[#d4d0c8] prose-strong:break-words
            prose-code:text-[#e8a000] prose-code:bg-[#111111] prose-code:border prose-code:border-[#1e1e1e] prose-code:text-xs prose-code:break-words
            prose-pre:bg-[#111111] prose-pre:border prose-pre:border-[#1e1e1e] prose-pre:rounded-none prose-pre:overflow-x-auto
            prose-blockquote:border-l-[#e8a000] prose-blockquote:text-[#666666] prose-blockquote:not-italic prose-blockquote:break-words
            prose-hr:border-[#1e1e1e]
            prose-li:text-[#888888] prose-li:text-xs sm:prose-li:text-sm prose-li:break-words
          ">
            <MarkdownRenderer content={post.content} />
          </div>

          {/* Author card */}
          <div className="border-t border-[#1e1e1e] pt-6 sm:pt-10 mt-8 sm:mt-10 w-full overflow-hidden">
            <div className="border border-[#1e1e1e] p-4 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full overflow-hidden">
              <div className="w-12 sm:w-14 h-12 sm:h-14 border border-[#2a2a2a] flex items-center justify-center text-sm sm:text-base font-bold text-[#e8a000] shrink-0">
                BO
              </div>
              <div className="space-y-2 flex-1 w-full overflow-hidden">
                <p className="text-xs sm:text-sm font-bold text-[#d4d0c8] break-words">Babalola Opeyemi</p>
                <p className="text-xs text-[#666666] leading-relaxed break-words">
                  Software Engineer and Platform Builder specialising in AI systems and secure infrastructure.
                  I write about my findings in the trenches of backend engineering.
                </p>
                <div className="flex gap-3 sm:gap-4 pt-1">
                  <a href="https://linkedin.com/in/babalola-opeyemi" className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#e8a000] hover:underline break-words">LinkedIn</a>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-[#0a0a0a]/90 flex items-center justify-center z-50 p-6">
          <div className="border border-red-500/30 bg-[#111111] p-8 max-w-md w-full font-mono">
            <p className="text-[10px] text-[#e8a000] uppercase tracking-widest mb-3">// confirm delete</p>
            <h3 className="text-base font-bold text-red-400 mb-2">Delete post?</h3>
            <p className="text-xs text-[#888888] leading-relaxed mb-8">
              Permanently remove &quot;{post.title}&quot;. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-500 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'deleting...' : 'confirm'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 border border-[#2a2a2a] text-[#888888] text-[10px] uppercase tracking-widest hover:border-[#e8a000] hover:text-[#e8a000] transition-colors"
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
