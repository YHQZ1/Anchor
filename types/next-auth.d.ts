/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    yourJWT?: string;
    accessToken?: string;
    profile?: {
      onboarding_completed: boolean;
      student_id: string | null;
      full_name: string | null;
      avatar_url: string | null;
    };
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
    profile?: {
      onboarding_completed: boolean;
      student_id: string | null;
      full_name: string | null;
      avatar_url: string | null;
    };
    user?: {
      id: string;
      email: string;
      username?: string;
      auth_provider?: string;
    };
  }
}