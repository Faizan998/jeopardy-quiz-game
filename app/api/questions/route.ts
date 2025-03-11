import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch all questions with answers and category
export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      include: {
        category: true, // Fetch category details
        Answer: true,   // Fetch answers related to question (using 'Answer' instead of 'answers')
      },
    });

    return NextResponse.json({ success: true, data: questions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch questions" }, { status: 500 });
  }
}

// POST: Add a new question
export async function POST(req: Request) {
  try {
    const { text, categoryId } = await req.json();

    if (!text || !categoryId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Create a new question with required fields
    const newQuestion = await prisma.question.create({
      data: { 
        value: text, // Using 'value' instead of 'text' to match the schema
        categoryId,
        options: [], // Required field in the schema
        amount: 0,   // Required field in the schema
        CorrectIdx: 0 // Required field in the schema
      },
    });

    return NextResponse.json({ success: true, data: newQuestion }, { status: 201 });
  } catch (error) {
    console.error("Error adding question:", error);
    return NextResponse.json({ success: false, error: "Failed to add question" }, { status: 500 });
  }
}
