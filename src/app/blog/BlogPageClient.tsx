'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { BlogPost } from '@/lib/supabase'
import { getPortfolioUrl } from '@/lib/urls'
import BlogPostCard from './components/BlogPostCard'

export default function BlogPageClient() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [drafts, setDrafts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published')
  
  const canCreate = session?.user?.role === 'admin' || session?.user?.role === 'contributor'

  const fetchPosts = useCallback(async () => {
    try {
      // fetch published posts - browser will cache based on API route headers
      const response = await fetch('/api/blog')
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      
      const data = await response.json()
      setPosts(data)

      // fetch drafts if user is authenticated (no cache for drafts)
      if (canCreate) {
        // fetch drafts in parallel for better performance
        const draftsResponse = await fetch('/api/blog/drafts', {
          cache: 'no-store'
        })
        if (draftsResponse.ok) {
          const draftsData = await draftsResponse.json()
          setDrafts(draftsData)
        }
      }
    } catch (error) {
      setError('Failed to load blog posts')
      console.error('Error fetching posts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [canCreate])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-all duration-300 ease-out">
      {/* Header */}
      <header className="border-b border-[var(--glass-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold font-mono gradient-text">brainiac's blog</h1>
              <p className="text-[var(--muted)] mt-2">
                {session?.user?.role === 'admin' 
                  ? 'my thoughts, my work, and stuff i tinker with' 
                  : session?.user?.role === 'contributor'
                    ? 'Welcome contributor! View and manage your posts'
                    : 'my thoughts, my work, and stuff i tinker with'
                }
              </p>
            </div>
                <div className="flex gap-4">
                  {canCreate && (
                    <Link
                      href="/blog/create"
                      className="btn btn-primary"
                    >
                      New Post
                    </Link>
                  )}
                  {session?.user?.role === 'admin' && (
                    <Link
                      href="/admin/users"
                      className="btn btn-secondary"
                    >
                      Manage Users
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      window.location.href = getPortfolioUrl()
                    }}
                    className="btn btn-secondary"
                  >
                    ← Portfolio
                  </button>
                  {session && (
                    <button
                      onClick={async () => {
                        try {
                          // Call custom sign out API to clear cookies
                          await fetch('/api/auth/signout', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                          })
                          
                          // Force page reload to clear session state
                          window.location.href = '/'
                        } catch (error) {
                          console.error('Sign out error:', error)
                          window.location.href = '/'
                        }
                      }}
                      className="btn btn-secondary"
                    >
                      Sign Out
                    </button>
                  )}
                </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {canCreate && (
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('published')}
              className={`px-4 py-2 rounded-lg font-mono transition-colors ${
                activeTab === 'published'
                  ? 'bg-[var(--accent)] text-white'
                  : 'glass hover:bg-[var(--accent)]'
              }`}
            >
              {session?.user?.role === 'admin' 
                ? `Published (${posts.length})` 
                : `My Published Posts (${posts.length})`
              }
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`px-4 py-2 rounded-lg font-mono transition-colors ${
                activeTab === 'drafts'
                  ? 'bg-[var(--accent)] text-white'
                  : 'glass hover:bg-[var(--accent)]'
              }`}
            >
              {session?.user?.role === 'admin' 
                ? `Drafts (${drafts.length})` 
                : `My Drafts (${drafts.length})`
              }
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-[var(--muted)]">Loading posts...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500">{error}</div>
            <button 
              onClick={fetchPosts}
              className="btn btn-primary mt-4"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'published' && (
              <>
                {posts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-[var(--muted)] mb-4">
                      {session?.user?.role === 'admin' 
                        ? 'No published posts yet' 
                        : 'You haven\'t published any posts yet'
                      }
                    </div>
                    {canCreate && (
                      <Link href="/blog/create" className="btn btn-primary">
                        {session?.user?.role === 'admin' 
                          ? 'Create First Post' 
                          : 'Create Your First Post'
                        }
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                      <BlogPostCard key={post.id} post={post} onDelete={fetchPosts} />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'drafts' && (
              <>
                {drafts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-[var(--muted)] mb-4">
                      {session?.user?.role === 'admin' 
                        ? 'No drafts yet' 
                        : 'You don\'t have any drafts yet'
                      }
                    </div>
                    <Link href="/blog/create" className="btn btn-primary">
                      {session?.user?.role === 'admin' 
                        ? 'Create New Draft' 
                        : 'Create Your First Draft'
                      }
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {drafts.map((post) => (
                      <BlogPostCard key={post.id} post={post} onDelete={fetchPosts} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
