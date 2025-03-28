import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "USER";
    image?: string;
    totalAmount: number;
    subscriptionType?: "NONE" | "ONE_MONTH" | "ONE_YEAR" | "LIFETIME";
    subscriptionTypeEnd?: string;
  }

  interface Session {
    user: User;
    expires: Date;
  }
} 