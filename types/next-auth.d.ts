import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    totalAmount: number;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      totalAmount: number;
    } & DefaultSession["user"]
  }
} 