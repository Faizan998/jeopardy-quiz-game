import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

const prisma = new PrismaClient();

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      totalAmount: number;
    }
  }
}

export const authOptions: NextAuthOptions = {
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
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing credentials");
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              role: true,
              totalAmount: true,
            },
          });

          if (!user || !user.password) {
            throw new Error("Invalid credentials");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Invalid credentials");
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            totalAmount: user.totalAmount,
          };
        } catch (error) {
          console.error("Login error:", error);
          throw new Error(error instanceof Error ? error.message : "Something went wrong");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      try {
        const userRole = user.email === "alifaizan15245@gmail.com" ? "ADMIN" : "USER";

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          const randomPassword = Math.random().toString(36).slice(-8);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          await prisma.user.create({
            data: {
              name: user.name,
              email: user.email,
              role: userRole,
              password: hashedPassword,
              image: user.image || null,
              totalAmount: 0,
            },
          });
        } else if (existingUser.role !== userRole) {
          await prisma.user.update({
            where: { email: user.email },
            data: { role: userRole },
          });
        }

        return true;
      } catch (error) {
        console.error("Error saving user:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        console.log("JWT Callback - User Role:", user.role); // Debugging
        token.totalAmount = user.totalAmount;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.totalAmount = token.totalAmount as number;
      }
      return session;
    },
  },
};


// import GoogleProvider from "next-auth/providers/google";
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcryptjs";
// import CredentialsProvider from "next-auth/providers/credentials";

// const prisma = new PrismaClient();

// export const authOptions = {
//   session: {
//     strategy: "jwt",
//   },
//   debug: true,
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         try {
//           console.log("credentials", credentials);

//           const user = await prisma.user.findUnique({
//             where: { email: credentials?.email },
//             select: { id: true, name: true, email: true, role: true, password: true, totalAmount: true }, 
//           });

//           if (!user) {
//             throw new Error("No user found");
//           }

//           if (!credentials?.password) {
//             throw new Error("Password is required");
//           }

//           const isValid = await bcrypt.compare(credentials.password, user.password!);
//           if (!isValid) {
//             throw new Error("Password is incorrect");
//           }

//           console.log("Login successful");

//           return {
//             id: user.id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             totalAmount: user.totalAmount ?? 0,
//           };
//         } catch (error) {
//           console.log("Login error:", error);
//           throw new Error(error instanceof Error ? error.message : "Something went wrong");
//         }
//       },
//     }),
//   ],

//   secret: process.env.NEXTAUTH_SECRET, // ✅ Fix: `NEXTAUTH_URL` nahi, `NEXTAUTH_SECRET` hona chahiye

//   callbacks: {
//     async signIn({ user }: { user: any }) {
//       try {
//         console.log("User signing in:", user);

//         const existingUser = await prisma.user.findUnique({
//           where: { email: user.email },
//         });

//         const userRole = existingUser ? existingUser.role : "USER";

//         if (!existingUser) {
//           const randomPassword = Math.random().toString(36).slice(-8);
//           const hashedPassword = await bcrypt.hash(randomPassword, 10);

//           await prisma.user.create({
//             data: {
//               name: user.name,
//               email: user.email,
//               role: userRole,
//               password: hashedPassword,
//               image: user.image || null,
//             },
//           });
//         }

//         return true;
//       } catch (error) {
//         console.error("Error saving user:", error);
//         return false;
//       }
//     },

//     async jwt({ token, user }: { token: any; user?: any }) {
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;
//         token.role = user.role;
//         token.totalAmount = user.totalAmount ?? 0;
//       }

//       return token;
//     },

//     async session({ session, token }: { session: any; token: any }) {
//       console.log("Session callback running...");

//       if (!token.email) {
//         console.log("Token email missing, session is null");
//         return null;
//       }

//       const dbUser = await prisma.user.findUnique({
//         where: { email: token.email },
//         select: { id: true, role: true, totalAmount: true },
//       });

//       if (!dbUser) {
//         console.log("User not found in DB, returning null session");
//         return null;
//       }

//       session.user = {
//         id: dbUser.id,
//         email: token.email,
//         role: dbUser.role,
//         totalAmount: dbUser.totalAmount ?? 0,
//       };

//       console.log("Final session object:", session);

//       return session;
//     },
//   },
// };

