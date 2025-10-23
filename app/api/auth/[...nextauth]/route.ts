import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
            }),
          })

          const data = await response.json()
          
          if (response.ok) {
            token.accessToken = account.access_token
            token.yourJWT = data.token
            token.user = data.user
            token.profile = data.profile
          }
        } catch {
          console.error('Google auth backend call failed')
        }
      }
      return token
    },
    async session({ session, token }) {
      session.yourJWT = token.yourJWT as string
      session.accessToken = token.accessToken as string
      session.profile = token.profile
      
      if (token.user) {
        session.user.id = token.user.id
        session.user.email = token.user.email
        session.user.name = token.user.username || token.user.email
      }
      
      return session
    },
  },
  pages: {
    signIn: '/auth',
  },
})

export { handler as GET, handler as POST }