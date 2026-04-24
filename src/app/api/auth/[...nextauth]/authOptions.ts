import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const API = (process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5003/api/v1').replace(/\/$/, '')

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const loginRes = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!loginRes.ok) return null
          const loginData = await loginRes.json()
          const token = loginData.token
          if (!token) return null

          const meRes = await fetch(`${API}/auth/me`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
          })

          if (!meRes.ok) return null
          const meData = await meRes.json()
          const me = meData.data

          return {
            id: me._id,
            _id: me._id,
            name: me.name,
            email: me.email,
            role: me.role,
            tel: me.tel ?? '',
            token,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      return user ? { ...token, ...user } : token
    },
    async session({ session, token }) {
      session.user = {
        _id: String(token._id ?? ''),
        name: String(token.name ?? ''),
        email: String(token.email ?? ''),
        role: String(token.role ?? ''),
        tel: String(token.tel ?? ''),
        token: String(token.token ?? ''),
      }
      return session
    },
  },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
}
