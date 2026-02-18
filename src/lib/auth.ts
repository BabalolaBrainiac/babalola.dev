import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { supabase } from './supabase'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Auth: Missing credentials')
          return null
        }

        if (!supabase) {
          console.log('Auth: Supabase not configured')
          return null
        }

        try {
          console.log('Auth: Attempting login for:', credentials.email)
          
          // Get user from database
          const { data: user, error } = await supabase
            .from('blog_users')
            .select('*')
            .eq('email', credentials.email)
            .single()

          if (error) {
            console.log('Auth: Database error:', error.message)
            return null
          }

          if (!user) {
            console.log('Auth: User not found')
            return null
          }

          console.log('Auth: User found, verifying password...')
          console.log('Auth: Stored hash starts with:', user.password_hash?.substring(0, 20))

          // Verify password using bcrypt
          const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash)
          
          console.log('Auth: Password valid?', isValidPassword)
          
          if (!isValidPassword) {
            console.log('Auth: Invalid password')
            return null
          }

          console.log('Auth: Login successful')
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('Auth: Error occurred:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || ''
        session.user.role = token.role
      }
      return session
    },
  },
  cookies: {
        sessionToken: {
          name: `next-auth.session-token`,
          options: {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 60, // 30 minutes
          },
        },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}
