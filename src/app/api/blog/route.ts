import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// cache configuration for public posts
export const revalidate = 60 // revalidate every 60 seconds

// GET - Fetch blog posts (published for public, all for authenticated users)
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    
    // optimize: select only needed fields for list view
    const selectFields = 'id, title, excerpt, slug, tags, created_at, updated_at, published, author_id'
    
    let query = supabase
      .from('blog_posts')
      .select(selectFields)
      .order('created_at', { ascending: false })

    // If user is authenticated, show posts based on role
    if (session?.user?.role === 'admin' || session?.user?.role === 'contributor') {
      if (session.user.role === 'admin') {
        // Admin can see all posts (published and drafts from all users)
        // No filter - admin sees everything
      } else {
        // Contributors only see their own posts (both published and drafts)
        query = query.eq('author_id', session.user.id)
      }
    } else {
      // Non-authenticated users only see published posts
      query = query.eq('published', true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // add cache headers for public requests
    const response = NextResponse.json(data)
    if (!session) {
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    }
    
    return response
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'contributor')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title, 
      content, 
      excerpt, 
      tags, 
      published, 
      slug
    } = body

    // Validate required fields
    if (!title || !content || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // build insert object with only core fields that exist in database
    const insertData: any = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      tags: tags || [],
      published: published || false,
      slug,
      author_id: session.user.id,
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([insertData])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
