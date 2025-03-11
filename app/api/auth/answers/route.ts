import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const { questionId, selectedAnswerId, userId } = await req.json();

    if (!questionId || !selectedAnswerId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const correctAnswer = await prisma.answer.findFirst({
      where: { questionId, correct: true, userId: null }, // Pre-defined correct answer
    });

    if (!correctAnswer) {
      return NextResponse.json({ error: "No correct answer found" }, { status: 404 });
    }

    const isCorrect = correctAnswer.id === selectedAnswerId;

    await prisma.answer.create({
      data: {
        text: selectedAnswerId, // Store the selected answer ID
        correct: isCorrect,
        userId,
        questionId,
      },
    });

    if (isCorrect) {
      await prisma.user.update({
        where: { id: userId },
        data: { totalScore: { increment: 10 } },
      });
    }

    return NextResponse.json({
      isCorrect,
      message: isCorrect ? "✅ Correct Answer!" : "❌ Wrong Answer!",
      correctAnswer: correctAnswer.text,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}