import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import jwt from "jsonwebtoken";

// Simple JWT verification function
const verifyJwtToken = async (token: string) => {
  try {
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, secret);
    return decoded as { id: string; email: string };
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
};

// GET: Fetch all answers with user & question details
export async function GET() {
  try {
    const answers = await prisma.answer.findMany({
      include: {
        question: true, // Fetch related question
        user: true, // Fetch related user
      },
    });
    return NextResponse.json({ success: true, data: answers });
  } catch (error) {
    console.error("Error fetching answers:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch answers" }, { status: 500 });
  }
}

// POST: Add a new answer
export async function POST(req: Request) {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract and verify the token
    const token = authHeader.split(" ")[1];
    const payload = await verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = payload.id;
    const { questionId, selectedAnswer, correctAnswer, points } = await req.json();

    // Check if the user has already answered this question
    const existingAnswer = await prisma.answer.findFirst({
      where: {
        userId,
        questionId,
      },
    });

    if (existingAnswer) {
      return NextResponse.json(
        { 
          success: false, 
          error: "You have already answered this question",
          details: "Each question can only be answered once"
        }, 
        { status: 400 }
      );
    }

    // Create the answer
    const isCorrect = selectedAnswer === correctAnswer;
    const answer = await prisma.answer.create({
      data: {
        userId,
        questionId,
        selectedIdx: selectedAnswer, // Using selectedIdx as per schema
        isCorrect,
      },
    });

    // Update user's total amount if answer is correct
    if (isCorrect && points) {
      await prisma.user.update({
        where: { id: userId },
        data: { totalAmount: { increment: points } }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        answerId: answer.id,
        isCorrect: answer.isCorrect,
        points: isCorrect ? points : 0,
      },
    });
  } catch (error) {
    console.error("Error adding answer:", error);
    return NextResponse.json({ success: false, error: "Failed to add answer" }, { status: 500 });
  }
}
