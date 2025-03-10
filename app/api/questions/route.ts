import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      include: { category: true, answers: true },
    });
    return NextResponse.json({ success: true, data: questions });
  } catch (error) {
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
