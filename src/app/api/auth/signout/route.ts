import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Clear the session token cookie
    const cookieStore = cookies()
    
    // Clear NextAuth session token
    cookieStore.delete('next-auth.session-token')
    cookieStore.delete('__Secure-next-auth.session-token')
    
    // Clear callback URL cookie
    cookieStore.delete('next-auth.callback-url')
    cookieStore.delete('__Secure-next-auth.callback-url')
    
    // Clear CSRF token
    cookieStore.delete('next-auth.csrf-token')
    cookieStore.delete('__Host-next-auth.csrf-token')

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully signed out' 
    })
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json(
      { error: 'Failed to sign out' }, 
      { status: 500 }
    )
  }
}
