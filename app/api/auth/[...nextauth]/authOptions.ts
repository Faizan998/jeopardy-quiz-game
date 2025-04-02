import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { Role, SubscriptionType } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const dbUser = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!dbUser) {
          return null;
        }

        const isValid = await compare(credentials.password, dbUser.password!);

        if (!isValid) {
          return null;
        }

        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          totalAmount: dbUser.totalAmount,
          subscriptionType: dbUser.subscriptionType,
          subscriptionTypeEnd: dbUser.subscriptionTypeEnd?.toISOString() || undefined,
        };
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role as Role,
          totalAmount: token.totalAmount,
          subscriptionType: token.subscriptionType as SubscriptionType,
          subscriptionTypeEnd: token.subscriptionTypeEnd || undefined,
        },
      };
    },
    jwt: ({ token, user }) => {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role as Role,
          totalAmount: user.totalAmount,
          subscriptionType: user.subscriptionType as SubscriptionType,
          subscriptionTypeEnd: user.subscriptionTypeEnd || undefined,
        };
      }
      return token;
    },
  },
};
