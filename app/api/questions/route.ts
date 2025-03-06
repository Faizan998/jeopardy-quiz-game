import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch all questions
export async function GET() {
  try {
    const questions = await prisma.question.findMany();
    return NextResponse.json({ success: true, data: questions }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch questions" }, { status: 500 });
  }
}
