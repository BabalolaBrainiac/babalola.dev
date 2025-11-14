'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'contributor'
  created_at: string
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleteUserPosts, setDeleteUserPosts] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'contributor' as 'admin' | 'contributor'
  })

  // Redirect if not admin
  useEffect(() => {
    if (session && session.user.role !== 'admin') {
      router.push('/blog')
    }
  }, [session, router])

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchUsers()
    }
  }, [session])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized access. Admin privileges required.')
          return
        }
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      setError('Failed to load users')
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.name || !formData.password) {
      alert('All fields are required')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized access. Admin privileges required.')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create user')
      }

      const newUser = await response.json()
      setUsers(prev => [newUser, ...prev])
      
      // Reset form
      setFormData({
        email: '',
        name: '',
        password: '',
        role: 'contributor'
      })
      setShowCreateForm(false)
      
      alert('User created successfully!')
    } catch (error) {
      console.error('Error creating user:', error)
      alert(error instanceof Error ? error.message : 'Failed to create user')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/users?id=${userToDelete.id}&deletePosts=${deleteUserPosts}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized access. Admin privileges required.')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete user')
      }

      const result = await response.json()
      
      // Remove user from the list
      setUsers(prev => prev.filter(user => user.id !== userToDelete.id))
      
      // Reset state
      setUserToDelete(null)
      setShowDeleteConfirm(false)
      
      alert(result.message || 'User deleted successfully!')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete user')
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmDeleteUser = (user: User) => {
    // Prevent admin from deleting themselves
    if (user.id === session?.user?.id) {
      alert('You cannot delete your own account')
      return
    }
    
    setUserToDelete(user)
    setDeleteUserPosts(false) // Reset checkbox
    setShowDeleteConfirm(true)
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
        <div className="text-center">
          <div className="text-[var(--muted)] mb-4">Please sign in to access this page</div>
          <Link href="/auth/signin" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (session.user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
        <div className="text-center">
          <div className="text-red-500 mb-4">Access denied. Admin privileges required.</div>
          <Link href="/blog" className="btn btn-primary">
            Back to Blog
          </Link>
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
              <h1 className="text-3xl font-bold font-mono gradient-text">User Management</h1>
              <p className="text-[var(--muted)] mt-2">Manage blog contributors and admins</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="btn btn-primary"
              >
                {showCreateForm ? 'Cancel' : 'Add New User'}
              </button>
              <Link href="/blog" className="btn btn-secondary">
                ← Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Create User Form */}
        {showCreateForm && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-bold font-mono gradient-text mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none"
                    placeholder="user@example.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none"
                    placeholder="Full Name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none"
                    placeholder="Secure password"
                    required
                    minLength={6}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'contributor' }))}
                    className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none"
                  >
                    <option value="contributor">Contributor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="btn btn-primary"
                >
                  {isCreating ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-[var(--muted)]">Loading users...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500">{error}</div>
            <button onClick={fetchUsers} className="btn btn-primary mt-4">
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-mono gradient-text mb-4">
              Users ({users.length})
            </h2>
            
            {users.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-[var(--muted)] mb-4">No users found</div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn btn-primary"
                >
                  Create First User
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {users.map((user) => (
                  <div key={user.id} className="glass-card p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="font-bold font-mono text-lg">{user.name}</h3>
                        <p className="text-[var(--muted)]">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs font-mono rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-red-500 text-white' 
                              : 'bg-blue-500 text-white'
                          }`}>
                            {user.role}
                          </span>
                          <span className="text-xs text-[var(--muted)]">
                            Joined: {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm text-[var(--muted)]">
                            {user.role === 'admin' ? 'Full Access' : 'Can Create Posts'}
                          </div>
                          {user.id === session?.user?.id && (
                            <div className="text-xs text-[var(--accent)] mt-1">
                              (You)
                            </div>
                          )}
                        </div>
                        
                        {user.id !== session?.user?.id && (
                          <button
                            onClick={() => confirmDeleteUser(user)}
                            disabled={isDeleting}
                            className="text-xs px-3 py-1 glass rounded-full hover:bg-red-500 transition-colors text-red-400 hover:text-white whitespace-nowrap"
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold font-mono mb-4 text-red-400">
              Delete User
            </h3>
            <p className="text-[var(--muted)] mb-4">
              Are you sure you want to delete <strong>{userToDelete.name}</strong> ({userToDelete.email})? 
              This action cannot be undone.
            </p>
            
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteUserPosts}
                  onChange={(e) => setDeleteUserPosts(e.target.checked)}
                  className="rounded border-[var(--glass-border)]"
                />
                <span className="text-sm text-[var(--muted)]">
                  Also delete all blog posts by this user
                </span>
              </label>
              <p className="text-xs text-[var(--muted)] mt-2 ml-6">
                {deleteUserPosts 
                  ? '⚠️ All blog posts by this user will be permanently deleted'
                  : '✅ Blog posts will be preserved (author will show as "Unknown")'
                }
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="btn bg-red-500 hover:bg-red-600 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Delete User'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setUserToDelete(null)
                  setDeleteUserPosts(false)
                }}
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
