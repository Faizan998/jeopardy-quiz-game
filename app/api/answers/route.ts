import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(req:Request) {
  try {
    const { questionId, selectedAnswer, userId } = await req.json();

    // Validate input
    if (!questionId || !selectedAnswer || !userId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Fetch the correct answer
    const correctAnswer = await prisma.answer.findFirst({
      where: { questionId, correct: true },
    });

    if (!correctAnswer) {
      return NextResponse.json({ success: false, error: "No correct answer found" }, { status: 404 });
    }

    // Compare selected answer with correct answer
    const isCorrect = correctAnswer.text === selectedAnswer;

    if (isCorrect) {
      return NextResponse.json({ success: true, message: "✅ Correct Answer!" });
    } else {
      return NextResponse.json({ success: false, message: "❌ Wrong Answer!" });
    }
  } catch (error) {
    console.error("Error verifying answer:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
