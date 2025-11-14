'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BlogPost } from '@/lib/supabase'

interface BlogUser {
  id: string
  email: string
  name: string
  role: string
  created_at: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<BlogUser[]>([])
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || !session.user || session.user.role !== 'admin') {
      router.push('/auth/signin')
      return
    }

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      // Fetch posts
      const postsResponse = await fetch('/api/blog')
      const postsData = await postsResponse.json()
      setPosts(postsData)

      // Fetch users (you'll need to create this API endpoint)
      const usersResponse = await fetch('/api/admin/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePost = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/blog/${slug}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPosts(posts.filter(post => post.slug !== slug))
      } else {
        alert('Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error deleting post')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] transition-all duration-300 ease-out">
        <div className="animate-pulse text-[var(--muted)]">Loading...</div>
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
              <h1 className="text-3xl font-bold font-mono gradient-text">Admin Dashboard</h1>
              <p className="text-[var(--muted)] mt-2">Manage blog posts and users</p>
            </div>
            <div className="flex gap-4">
              <Link href="/blog" className="btn btn-secondary">
                ← Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-lg font-mono transition-colors ${
              activeTab === 'posts'
                ? 'bg-[var(--accent)] text-white'
                : 'glass hover:bg-[var(--accent)]'
            }`}
          >
            Blog Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-mono transition-colors ${
              activeTab === 'users'
                ? 'bg-[var(--accent)] text-white'
                : 'glass hover:bg-[var(--accent)]'
            }`}
          >
            Users ({users.length})
          </button>
        </div>

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-mono gradient-text">Blog Posts</h2>
              <Link href="/blog/create" className="btn btn-primary">
                Create New Post
              </Link>
            </div>
            
            <div className="grid gap-4">
              {posts.map((post) => (
                <div key={post.id} className="glass-card p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold font-mono gradient-text mb-2">
                        {post.title}
                      </h3>
                      <p className="text-[var(--muted)] mb-2">{post.excerpt}</p>
                      <div className="flex gap-2 mb-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs font-mono glass rounded-full"
                            style={{ color: 'var(--accent)' }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-[var(--muted)]">
                        Created: {new Date(post.created_at).toLocaleDateString()}
                        {post.updated_at !== post.created_at && (
                          <span> • Updated: {new Date(post.updated_at).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="btn btn-secondary text-sm"
                      >
                        View
                      </Link>
                      <Link
                        href={`/blog/${post.slug}/edit`}
                        className="btn btn-primary text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeletePost(post.slug)}
                        className="btn btn-secondary text-sm bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-mono gradient-text">Users</h2>
              <button className="btn btn-primary">
                Add New User
              </button>
            </div>
            
            <div className="grid gap-4">
              {users.map((user) => (
                <div key={user.id} className="glass-card p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold font-mono gradient-text mb-1">
                        {user.name}
                      </h3>
                      <p className="text-[var(--muted)] mb-2">{user.email}</p>
                      <span className={`px-2 py-1 text-xs font-mono rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-blue-500 text-white'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary text-sm">
                        Edit
                      </button>
                      <button className="btn btn-secondary text-sm bg-red-500 hover:bg-red-600">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
