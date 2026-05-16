import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'

const ALLOWED_EMAIL = 'brainiac@babalola.dev'

// This route sets up/updates the single admin user
// CALL THIS ONCE: curl -X POST http://localhost:3000/api/admin/setup
export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Get password from environment variable (required in all environments)
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      return NextResponse.json(
        { error: 'ADMIN_PASSWORD environment variable is not set' },
        { status: 400 }
      )
    }
    
    // Hash password with bcrypt (12 rounds)
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds)

    // Use raw SQL via rpc to bypass RLS issues
    // First, check if user exists
    const { data: existingUsers, error: checkError } = await supabase
      .rpc('get_user_by_email', { user_email: ALLOWED_EMAIL })

    if (checkError) {
      console.error('Check error:', checkError)
      // Try direct query as fallback
      const { data } = await supabase
        .from('blog_users')
        .select('id')
        .eq('email', ALLOWED_EMAIL)
        .maybeSingle()
      
      if (data) {
        // Update existing user
        const { error: updateError } = await supabase
          .from('blog_users')
          .update({
            password_hash: passwordHash,
            role: 'admin',
            name: 'Brainiac',
            updated_at: new Date().toISOString()
          })
          .eq('email', ALLOWED_EMAIL)

        if (updateError) {
          console.error('Update error:', updateError)
          return NextResponse.json({
            error: 'Failed to update user. Check server logs and Supabase dashboard.'
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: 'Admin user updated successfully',
          email: ALLOWED_EMAIL,
          note: 'Password has been hashed securely with bcrypt'
        })
      }
    }

    if (existingUsers && existingUsers.length > 0) {
      // Update existing user using RPC or direct update
      const { error: updateError } = await supabase
        .from('blog_users')
        .update({
          password_hash: passwordHash,
          role: 'admin',
          name: 'Brainiac',
          updated_at: new Date().toISOString()
        })
        .eq('email', ALLOWED_EMAIL)

      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Admin user updated successfully',
        email: ALLOWED_EMAIL,
        note: 'Password has been hashed securely with bcrypt'
      })
    } else {
      // Create new user - generate UUID
      const { data: newUser, error: insertError } = await supabase
        .from('blog_users')
        .insert([{
          email: ALLOWED_EMAIL,
          name: 'Brainiac',
          password_hash: passwordHash,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id, email, name, role, created_at')
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        return NextResponse.json({
          error: 'Failed to create user via API. Check server logs and Supabase dashboard.'
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Admin user created successfully',
        email: ALLOWED_EMAIL,
        userId: newUser.id,
        note: 'Password has been hashed securely with bcrypt'
      })
    }
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
