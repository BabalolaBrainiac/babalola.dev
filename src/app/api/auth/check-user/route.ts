import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Check if any user exists in the database
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ exists: false, error: 'Database not configured' }, { status: 500 })
    }

    const { count, error } = await supabase
      .from('blog_users')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Check user error:', error)
      return NextResponse.json({ exists: false, error: 'Failed to check' }, { status: 500 })
    }

    return NextResponse.json({ exists: count ? count > 0 : false })
  } catch (error) {
    console.error('Check user error:', error)
    return NextResponse.json({ exists: false }, { status: 500 })
  }
}
