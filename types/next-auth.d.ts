import { Role, SubscriptionType } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string | null;
    email: string | null;
    role: Role;
    totalAmount: number;
    subscriptionType: SubscriptionType;
    subscriptionTypeEnd?: string;
  }

  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      role: Role;
      totalAmount: number;
      subscriptionType: SubscriptionType;
      subscriptionTypeEnd?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    totalAmount: number;
    subscriptionType: SubscriptionType;
    subscriptionTypeEnd?: string;
  }
}