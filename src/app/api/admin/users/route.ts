import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// GET - Fetch all users (admin only)
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Check authentication - only admin can view users
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('blog_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new user (admin only)
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Check authentication - only admin can create users
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, name, password, role } = body

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate role
    if (role && !['admin', 'contributor'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Hash the password
    const saltRounds = 12
    const password_hash = await bcrypt.hash(password, saltRounds)

    const { data, error } = await supabase
      .from('blog_users')
      .insert([{
        email,
        name,
        password_hash,
        role: role || 'contributor'
      }])
      .select('id, email, name, role, created_at')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Check authentication - only admin can delete users
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    const deletePosts = searchParams.get('deletePosts') === 'true'

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
    }

    // Check if user exists
    const { data: user, error: fetchError } = await supabase
      .from('blog_users')
      .select('id, email, name, role')
      .eq('id', userId)
      .single()

    if (fetchError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Optionally delete user's blog posts
    if (deletePosts) {
      const { error: postsError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('author_id', userId)

      if (postsError) {
        return NextResponse.json({ error: `Failed to delete user's posts: ${postsError.message}` }, { status: 500 })
      }
    }

    // Delete the user
    const { error } = await supabase
      .from('blog_users')
      .delete()
      .eq('id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const postsMessage = deletePosts ? ' and their blog posts' : ' (blog posts preserved)'
    return NextResponse.json({ 
      message: `User ${user.name} (${user.email}) has been deleted successfully${postsMessage}` 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
