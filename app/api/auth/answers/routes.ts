import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/app/lib/auth"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await auth()

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { questionId, answerId } = await request.json()

    if (!questionId || !answerId) {
      return NextResponse.json({ error: "Question ID and Answer ID are required" }, { status: 400 })
    }

    // Get the answer to check if it's correct
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      select: { correct: true, text: true },
    })

    if (!answer) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 })
    }

    // Record the user's answer
    await prisma.answer.create({
      data: {
        text: answer.text,
        correct: answer.correct,
        questionId: questionId,
        userId: userId,
      },
    })

    return NextResponse.json({
      success: true,
      correct: answer.correct,
    })
  } catch (error) {
    console.error("Error submitting answer:", error)
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

