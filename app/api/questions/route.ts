import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      include: { category: true },
    });

    console.log("Fetched Questions:", questions); // ✅ Debugging line

    return NextResponse.json({ success: true, data: questions });
  } catch (error) {
    console.error("API Error:", error); // ✅ Debugging error
    return NextResponse.json({ success: false, error: "Failed to fetch questions" }, { status: 500 });
  }
}
