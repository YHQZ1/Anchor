import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        try {
          // Call your existing backend to create/login user
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              googleAccessToken: account.access_token,
              email: user.email,
              name: user.name,
            }),
          });

          const data = await response.json();
          
          if (response.ok) {
            token.accessToken = account.access_token;
            token.yourJWT = data.token; // Your existing JWT
            token.user = data.user;
            
            // Store JWT in localStorage on the client side
            // We'll handle this in the session callback
          }
        } catch (error) {
          console.error('Google auth backend call failed:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send custom JWT to client
      session.yourJWT = token.yourJWT as string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session.user = token.user as any;
      session.accessToken = token.accessToken as string;
      
      // Remove this part - we'll handle localStorage in the layout
      // if (typeof window !== 'undefined' && token.yourJWT) {
      //   localStorage.setItem('jwtToken', token.yourJWT);
      // }
      
      return session;
    },
  },
  pages: {
    signIn: '/auth',
  },
});

export { handler as GET, handler as POST };