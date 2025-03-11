import { NextResponse } from "next/server";
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
  }
}
