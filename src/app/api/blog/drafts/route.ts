import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// no cache for drafts - always fresh
export const revalidate = 0

// GET - Fetch draft posts for the authenticated user
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'contributor')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // optimize: select only needed fields for list view
    const selectFields = 'id, title, excerpt, slug, tags, created_at, updated_at, published, author_id'
    
    let query = supabase
      .from('blog_posts')
      .select(selectFields)
      .eq('published', false)
      .order('updated_at', { ascending: false })

    // admin sees all drafts, contributors only their own
    if (session.user.role !== 'admin') {
      query = query.eq('author_id', session.user.id)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
