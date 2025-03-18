import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "USER";
    image?: string;
    totalAmount: number;
  }

  interface Session {
    user: User;
    expires: Date;
  }
} 