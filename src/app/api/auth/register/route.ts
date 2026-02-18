import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'

const ALLOWED_EMAIL = 'brainiac@babalola.dev'

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { email, name, password, role = 'contributor' } = body

    // SECURITY: Check if any user already exists
    const { count, error: countError } = await supabase
      .from('blog_users')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Count error:', countError)
    }

    // BLOCK: If any user exists, registration is closed
    if (count && count > 0) {
      return NextResponse.json({ 
        error: 'Registration is closed. User already exists.' 
      }, { status: 403 })
    }

    // SECURITY: Only allow the specific admin email
    if (email !== ALLOWED_EMAIL) {
      return NextResponse.json({ 
        error: 'Registration is closed. Invalid email.' 
      }, { status: 403 })
    }

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Force admin role for the allowed email
    const userRole = 'admin'

    // Hash password with bcrypt (12 rounds)
    const saltRounds = 12
    const password_hash = await bcrypt.hash(password, saltRounds)

    // Create user
    const { data: user, error } = await supabase
      .from('blog_users')
      .insert([{
        email,
        name,
        password_hash,
        role: userRole
      }])
      .select('id, email, name, role, created_at')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
