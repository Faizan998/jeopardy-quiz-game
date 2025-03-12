import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";

export async function GET(req: Request) {
  try {
    // Get top users by totalAmount
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        totalAmount: true,
      },
      orderBy: {
        totalAmount: "desc",
      },
      take: 100, // Limit to top 100 users
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { message: "Error fetching leaderboard" },
      { status: 500 }
    );
  }
} 