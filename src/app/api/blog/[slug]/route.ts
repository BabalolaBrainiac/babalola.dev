import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// cache configuration for published posts
export const revalidate = 300 // revalidate every 5 minutes

// GET - Fetch a specific blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', params.slug)

    // If user is authenticated, they can view their own drafts
    if (session?.user?.role === 'admin' || session?.user?.role === 'contributor') {
      // Admin can view any post, contributors can view their own posts
      if (session.user.role === 'admin') {
        // Admin can view all posts (published and drafts)
        // No additional filter needed
      } else {
        // Contributors can only view published posts OR their own drafts
        query = query.or(`published.eq.true,and(author_id.eq.${session.user.id},published.eq.false)`)
      }
    } else {
      // Non-authenticated users can only view published posts
      query = query.eq('published', true)
    }

    const { data, error } = await query.single()

    if (error) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // add cache headers for public requests
    const response = NextResponse.json(data)
    if (!session) {
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    }
    
    return response
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update a blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'contributor')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the post to check author
    const { data: existingPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('author_id')
      .eq('slug', params.slug)
      .single()

    if (fetchError || !existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check if user is the author or admin
    if (session.user.role !== 'admin' && existingPost.author_id !== session.user.id) {
      return NextResponse.json({ error: 'You can only edit your own posts' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, excerpt, tags, published } = body

    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        title,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        tags: tags || [],
        published: published || false,
        updated_at: new Date().toISOString()
      })
      .eq('slug', params.slug)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Check authentication - only admin can delete
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('slug', params.slug)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
