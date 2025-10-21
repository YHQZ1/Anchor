import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    yourJWT?: string;
    accessToken?: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    yourJWT?: string;
    accessToken?: string;
  }
}