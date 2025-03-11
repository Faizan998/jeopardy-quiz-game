import { NextResponse } from "next/server";
<<<<<<< HEAD
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch all answers with user & question details
export async function GET() {
  try {
    const answers = await prisma.answer.findMany({
      include: {
        question: true, // Fetch related question
        user: { select: { id: true, email: true, name: true } }, // Fetch user details
      },
    });

    return NextResponse.json({ success: true, data: answers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching answers:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch answers" }, { status: 500 });
  }
}

// POST: Add a new answer
export async function POST(req: Request) {
  try {
    const { text, correct, userId, questionId } = await req.json();

    if (!text || !userId || !questionId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    
    // Looking at your schema, the field is 'selectedIdx' not 'answer'
    const newAnswer = await prisma.answer.create({
      data: { 
        selectedIdx: text, // Using 'selectedIdx' instead of 'answer'
        isCorrect: correct, // Using 'isCorrect' instead of 'correct'
        userId,
        questionId
      },
    });

    return NextResponse.json({ success: true, data: newAnswer }, { status: 201 });
  } catch (error) {
    console.error("Error adding answer:", error);
    return NextResponse.json({ success: false, error: "Failed to add answer" }, { status: 500 });
=======
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
>>>>>>> f36b59a92228e1c92da773728ba55f9e12a14bfa
  }
}
