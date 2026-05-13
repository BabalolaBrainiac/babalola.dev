import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'admin' | 'contributor' | 'learner'
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: 'admin' | 'contributor' | 'learner'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'admin' | 'contributor' | 'learner'
  }
}
