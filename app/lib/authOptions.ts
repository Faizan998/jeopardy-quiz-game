import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import prisma from './prisma';

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "ADMIN" | "USER";
    }
  }
  interface User {
    role: "ADMIN" | "USER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMIN" | "USER";
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'google') {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            const isAdmin = user.email === process.env.ADMIN_EMAIL;
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                role: isAdmin ? "ADMIN" : "USER",
              },
            });
          }
        }
        return true;
      } catch (error) {
        console.error('SignIn error:', error);
        return false;
      }
    },
    async jwt({ token, user, trigger }) {
      try {
        if (trigger === "signIn" || trigger === "signUp" || !token.role) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email! },
          });
          
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser.id;
          }
        }
        return token;
      } catch (error) {
        console.error('JWT error:', error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (session?.user) {
          session.user.role = token.role;
          session.user.id = token.id;
        }
        return session;
      } catch (error) {
        console.error('Session error:', error);
        return session;
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        // For OAuth sign-in callbacks
        if (url.includes('/api/auth/callback')) {
          const userEmail = url.includes('user_email=') 
            ? decodeURIComponent(url.split('user_email=')[1].split('&')[0])
            : null;

          // Check if the user is an admin
          if (userEmail === process.env.ADMIN_EMAIL) {
            return `${baseUrl}/admin-dashboard`;
          }
          return baseUrl;
        }

        // For sign-in page
        if (url === `${baseUrl}/login`) {
          return baseUrl;
        }

        // For admin routes
        if (url.includes('/admin-dashboard')) {
          return `${baseUrl}/admin-dashboard`;
        }

        // Default cases
        if (url.startsWith(baseUrl)) return url;
        if (url.startsWith('/')) return `${baseUrl}${url}`;
        return baseUrl;
      } catch (error) {
        console.error('Redirect error:', error);
        return baseUrl;
      }
    }
  },
  events: {
    async signIn({ user }) {
      try {
        if (user.email === process.env.ADMIN_EMAIL) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          
          if (dbUser && dbUser.role !== 'ADMIN') {
            await prisma.user.update({
              where: { email: user.email },
              data: { role: 'ADMIN' },
            });
          }
        }
      } catch (error) {
        console.error('SignIn event error:', error);
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
};
