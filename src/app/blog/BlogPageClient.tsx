'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { BlogPost } from '@/lib/supabase'
import { getPortfolioUrl } from '@/lib/urls'
import BlogPostCard from './components/BlogPostCard'

export default function BlogPageClient() {
  const { data: session } = useSession()
  const [posts,    setPosts]    = useState<BlogPost[]>([])
  const [drafts,   setDrafts]   = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,    setError]    = useState('')
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published')
  const [filter,   setFilter]   = useState('All')

  const canCreate = session?.user?.role === 'admin' || session?.user?.role === 'contributor'

  const categories = useMemo(() => {
    const cats = new Set(['All'])
    posts.forEach(p => {
      const cat = p.tags?.[0]
      if (cat) cats.add(cat.charAt(0).toUpperCase() + cat.slice(1))
    })
    return Array.from(cats)
  }, [posts])

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/blog')
      if (!res.ok) throw new Error('Failed to fetch posts')
      setPosts(await res.json())
      if (canCreate) {
        const dr = await fetch('/api/blog/drafts', { cache: 'no-store' })
        if (dr.ok) setDrafts(await dr.json())
      }
    } catch {
      setError('Failed to load blog posts')
    } finally {
      setIsLoading(false)
    }
  }, [canCreate])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const featuredPost    = posts[0]
  const recentPosts     = posts.slice(1, 5)
  const remainingPosts  = posts
    .slice(5)
    .filter(p => filter === 'All' || p.tags?.[0]?.toLowerCase() === filter.toLowerCase())

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4d0c8] font-mono">

      {/* Header */}
      <header className="border-b border-[#1e1e1e] bg-[#0a0a0a] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-[#e8a000]">brainiac&apos;s blog</h1>
            <p className="text-[10px] text-[#555555] mt-0.5 tracking-wide">platform engineering & ai</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {canCreate && (
              <Link href="/blog/create" className="btn btn-primary">+ new post</Link>
            )}
            <button
              onClick={() => { window.location.href = getPortfolioUrl() }}
              className="btn btn-ghost"
            >
              ← portfolio
            </button>
            {session && (
              <button
                onClick={async () => {
                  try {
                    await fetch('/api/auth/signout', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
                    window.location.href = '/'
                  } catch { window.location.href = '/' }
                }}
                className="btn btn-ghost"
              >
                sign out
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        {isLoading ? (
          <div className="py-32 text-center text-[10px] text-[#3a3a3a] uppercase tracking-widest">
            loading posts...
          </div>
        ) : error ? (
          <div className="py-32 text-center space-y-4">
            <p className="text-xs text-red-400">{error}</p>
            <button onClick={fetchPosts} className="btn btn-secondary">retry</button>
          </div>
        ) : (
          <div className="space-y-16">

            {/* Admin tabs */}
            {canCreate && (
              <div className="flex gap-1 border-b border-[#1e1e1e]">
                {(['published', 'drafts'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-[10px] uppercase tracking-widest px-4 py-2.5 border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-[#e8a000] text-[#e8a000]'
                        : 'border-transparent text-[#555555] hover:text-[#888888]'
                    }`}
                  >
                    {tab === 'published' ? `published (${posts.length})` : `drafts (${drafts.length})`}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'drafts' && canCreate ? (
              drafts.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <p className="text-xs text-[#555555]">no drafts yet</p>
                  <Link href="/blog/create" className="btn btn-primary">create new draft</Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {drafts.map(post => (
                    <BlogPostCard key={post.id} post={post} onDelete={fetchPosts} />
                  ))}
                </div>
              )
            ) : posts.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <p className="text-xs text-[#555555]">no posts yet</p>
                {canCreate && <Link href="/blog/create" className="btn btn-primary">write first post</Link>}
              </div>
            ) : (
              <>
                {/* Magazine hero */}
                <div className="grid lg:grid-cols-12 gap-10 items-start">
                  {featuredPost && (
                    <Link href={`/blog/${featuredPost.slug}`} className="lg:col-span-8 group block space-y-4">
                      <div className="aspect-[16/9] bg-[#111111] border border-[#1e1e1e] group-hover:border-[#e8a000] transition-colors overflow-hidden relative">
                        {featuredPost.og_image ? (
                          <img
                            src={featuredPost.og_image}
                            alt={featuredPost.title}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[10px] text-[#3a3a3a] uppercase tracking-widest">featured</span>
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <span className="text-[9px] bg-[#e8a000] text-[#0a0a0a] px-2 py-0.5 uppercase tracking-widest font-bold">
                            {featuredPost.tags?.[0] || 'featured'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-[10px] text-[#444444]">
                          <span>{new Date(featuredPost.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span>·</span>
                          <span>{Math.max(1, Math.ceil((featuredPost.content?.length || 0) / 1200))} min read</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#d4d0c8] group-hover:text-[#e8a000] transition-colors leading-snug">
                          {featuredPost.title}
                        </h2>
                        <p className="text-sm text-[#666666] leading-relaxed line-clamp-2">
                          {featuredPost.excerpt}
                        </p>
                      </div>
                    </Link>
                  )}

                  <div className="lg:col-span-4 space-y-6">
                    <p className="text-[10px] text-[#e8a000] uppercase tracking-widest border-b border-[#1e1e1e] pb-3">
                      recent
                    </p>
                    <div className="space-y-5">
                      {recentPosts.map(post => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="group block space-y-1 pb-5 border-b border-[#1e1e1e] last:border-0 last:pb-0">
                          <p className="text-[9px] text-[#444444] uppercase tracking-widest">
                            {post.tags?.[0] || 'engineering'}
                          </p>
                          <h4 className="text-sm font-semibold text-[#d4d0c8] group-hover:text-[#e8a000] transition-colors line-clamp-2 leading-snug">
                            {post.title}
                          </h4>
                          <p className="text-[10px] text-[#444444]">
                            {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category filter */}
                {categories.length > 1 && (
                  <div className="flex items-center gap-1 flex-wrap border-y border-[#1e1e1e] py-4">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors ${
                          filter === cat
                            ? 'border-[#e8a000] text-[#e8a000] bg-[rgba(232,160,0,0.04)]'
                            : 'border-[#1e1e1e] text-[#555555] hover:border-[#2a2a2a] hover:text-[#888888]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* Remaining grid */}
                {remainingPosts.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {remainingPosts.map(post => (
                      <BlogPostCard key={post.id} post={post} onDelete={fetchPosts} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-[#1e1e1e] px-5 sm:px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-[10px] text-[#2a2a2a] uppercase tracking-widest">© {new Date().getFullYear()} Babalola Opeyemi</p>
          <div className="flex gap-5 text-[10px] text-[#2a2a2a] uppercase tracking-widest">
            <a href="https://linkedin.com/in/babalola-opeyemi" className="hover:text-[#e8a000] transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
