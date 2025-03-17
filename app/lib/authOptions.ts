import { PrismaClient } from "@prisma/client";
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("credentials", credentials);
          const user = await prisma.user.findUnique({
            where: { email: credentials?.email },
          });

          if (!user) {
            throw new Error("No user found");
          }

          if (!credentials?.password) {
            throw new Error("Password is required");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password!);
          if (!isValid) {
            throw new Error("Password is incorrect");
          }

          console.log("login done");
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: "USER",
          };
        } catch (error) {
          console.log("error", error);
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("Something went wrong");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      console.log("signIn", user);
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        console.log("user exists info", dbUser);

        if (!dbUser) {
          const role = user.email === process.env.ADMIN_EMAIL ? "ADMIN" : "USER";
          console.log(role);

          const createdUser = await prisma.user.create({
            data: {
              role: role,
              email: user.email!,
              name: user.name!,
              image: user.image ? user.image : "",
            },
          });

          console.log("user created info", createdUser);
          user.role = createdUser.role;
          user.id = createdUser.id;
        } else {
          user.role = dbUser.role;
          user.id = dbUser.id;
        }

        return true;
      } catch (error) {
        console.error("Error saving user:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        console.log("token.role", token.role);
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};