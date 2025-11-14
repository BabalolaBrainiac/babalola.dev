import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'admin' | 'contributor'
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: 'admin' | 'contributor'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'admin' | 'contributor'
  }
}
