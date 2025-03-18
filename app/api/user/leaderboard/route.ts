import { getServerSession } from "next-auth";
import {  NextResponse } from "next/server";
import { authOptions } from "@/app/lib/authOptions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log(session);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const leaderBoardData = await prisma.user.findMany({
      // include: {
      //   Answer: true,
      // },
      where: {
        totalAmount: {
          gt: 0,
        },
      },
      orderBy: {
        totalAmount: "desc",
      },
      omit: {
        password: true,
      },
      take: 10,
    });

    if (!leaderBoardData) {
      return NextResponse.json({ error: "No data found" }, { status: 400 });
    }

    return NextResponse.json({ data: leaderBoardData }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}