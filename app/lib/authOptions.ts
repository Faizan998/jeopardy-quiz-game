import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";


const prisma = new PrismaClient();

export const authOptions = {
  debug: true, // Enable Debugging
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }: { user: any }) {
      try {
        console.log("User signing in:", user);

        const userRole = user.email === "alifaizan15245@gmail.com" ? "ADMIN" : "USER";

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // 🛠️ Random Hashed Password Generate Karo
          const randomPassword = Math.random().toString(36).slice(-8); // Random password
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          await prisma.user.create({
            data: {
              name: user.name,
              email: user.email,
              role: userRole,
              password: hashedPassword,// Store hashed password
              image: user.image ? user.image : null,
            },
          });
        } else {
          // Update role agar zarurat ho
          if (existingUser.role !== userRole) {
            await prisma.user.update({
              where: { email: user.email },
              data: { role: userRole },
            });
          }
        }
     

        return true;
      } catch (error) {
        console.error("Error saving user:", error);
        return false;
      }
    },

    async jwt({ token, account }: { token: any; account?: any }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
