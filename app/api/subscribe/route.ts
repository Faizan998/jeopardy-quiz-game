import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscriptionType } = await req.json();

    // Calculate subscription end date based on type
    let subscriptionTypeEnd: Date | null = null;
    switch (subscriptionType) {
      case "ONE_MONTH":
        subscriptionTypeEnd = new Date();
        subscriptionTypeEnd.setMonth(subscriptionTypeEnd.getMonth() + 1);
        break;
      case "ONE_YEAR":
        subscriptionTypeEnd = new Date();
        subscriptionTypeEnd.setFullYear(subscriptionTypeEnd.getFullYear() + 1);
        break;
      case "LIFETIME":
        // For lifetime subscriptions, we'll set a far future date
        subscriptionTypeEnd = new Date("2100-12-31");
        break;
    }

    // Update user's subscription
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        subscriptionType,
        subscriptionTypeEnd,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
} 