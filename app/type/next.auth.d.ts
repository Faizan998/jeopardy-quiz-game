import { Session as DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    role?: string; // Optional role field
    accessToken?: string; // Optional access token for API calls
    token?: string; // Optional token for API calls
  }

  interface User {
    id: string;
    role?: string; // Add role to User if it comes from your auth provider
    accessToken?: string;
    token?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string; // Add role to JWT
    accessToken?: string; // Add accessToken to JWT
  }
}