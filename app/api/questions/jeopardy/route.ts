import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import jwt from "jsonwebtoken";
import quizData from "@/data/quizdata";

// In-memory storage for user answers (this will reset on server restart)
// In a production app, you would use a database
const userAnswers: Record<string, Record<string, boolean>> = {};

interface JeopardyQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  points: number;
  categoryId: string;
  categoryName: string;
  isAnswered?: boolean;
  isCorrect?: boolean | null;
}

// GET: Fetch questions formatted for Jeopardy game
export async function GET(req: Request) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Extract and verify the token
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || "default_secret") as { id: string; role: string };
    const userId = decoded.id;

    // Get user's answered questions from memory
    const userAnsweredQuestions = userAnswers[userId] || {};

    // Create a map of answered questions for quick lookup
    const answeredQuestions = new Map<string, boolean>();
    Object.entries(userAnsweredQuestions).forEach(([questionId, isCorrect]) => {
      answeredQuestions.set(questionId, isCorrect);
    });

    // Format questions from quiz data
    const jeopardyQuestions: JeopardyQuestion[] = [];
    
    // Process quiz data
    quizData.categories.forEach((category, categoryIndex) => {
      category.questions.forEach((question, questionIndex) => {
        const questionId = `${categoryIndex}-${questionIndex}`;
        
        // Get the options and correct answer
        const options = question.options;
        const correctAnswer = options[question.correctIndex];
        
        // Determine if user has already answered this question
        const isAnswered = answeredQuestions.has(questionId);
        const isCorrect = isAnswered ? answeredQuestions.get(questionId) : null;
        
        jeopardyQuestions.push({
          id: questionId,
          text: question.question,
          options,
          correctAnswer,
          points: question.amount,
          categoryId: categoryIndex.toString(),
          categoryName: category.name,
          isAnswered,
          isCorrect,
        });
      });
    });

    // Group questions by points
    const groupedQuestions: Record<number, JeopardyQuestion[]> = {
      100: [],
      200: [],
      300: [],
      400: [],
      500: [],
    };

    // Distribute questions by their amount
    jeopardyQuestions.forEach((question) => {
      const amount = question.points;
      // Only add to valid point groups (100, 200, 300, 400, 500)
      if (amount <= 500 && groupedQuestions[amount]) {
        groupedQuestions[amount].push(question);
      } else {
        // If amount is not one of our standard values, assign to a random group
        const pointValues = [100, 200, 300, 400, 500];
        const randomIndex = Math.floor(Math.random() * pointValues.length);
        const randomAmount = pointValues[randomIndex];
        groupedQuestions[randomAmount].push({
          ...question,
          points: randomAmount
        });
      }
    });

    // Ensure we have at least 3 questions per amount
    const pointValues = [100, 200, 300, 400, 500];
    const allQuestions = [...jeopardyQuestions];
    
    pointValues.forEach((amount) => {
      // If we have fewer than 3 questions for this amount
      while (groupedQuestions[amount].length < 3 && allQuestions.length > 0) {
        // Take a question from the pool and modify its amount
        const randomIndex = Math.floor(Math.random() * allQuestions.length);
        const question = { ...allQuestions[randomIndex], points: amount, id: `${allQuestions[randomIndex].id}-${amount}` };
        
        // Remove the question from the pool to avoid duplicates
        allQuestions.splice(randomIndex, 1);
        
        // Add to the group
        groupedQuestions[amount].push(question);
      }
      
      // If we still don't have enough questions, duplicate existing ones
      if (groupedQuestions[amount].length < 3) {
        const existingQuestions = [...groupedQuestions[amount]];
        let index = 0;
        
        while (groupedQuestions[amount].length < 3) {
          const questionToDuplicate = existingQuestions[index % existingQuestions.length];
          groupedQuestions[amount].push({
            ...questionToDuplicate,
            id: `${questionToDuplicate.id}-dup-${index}`
          });
          index++;
        }
      }
      
      // Limit to 3 questions per amount
      groupedQuestions[amount] = groupedQuestions[amount].slice(0, 3);
    });

    // Log the questions for debugging
    console.log("Returning questions:", {
      totalQuestions: Object.values(groupedQuestions).flat().length,
      questionsByAmount: {
        100: groupedQuestions[100].length,
        200: groupedQuestions[200].length,
        300: groupedQuestions[300].length,
        400: groupedQuestions[400].length,
        500: groupedQuestions[500].length,
      }
    });

    return NextResponse.json({ success: true, data: groupedQuestions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching jeopardy questions:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch questions", 
      details: (error as Error).message 
    }, { status: 500 });
  }
}

// POST: Store a user's answer (for in-memory storage)
export async function POST(req: Request) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Extract and verify the token
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || "default_secret") as { id: string; role: string };
    const userId = decoded.id;

    const { questionId, isCorrect } = await req.json();

    // Initialize user's answers if not exists
    if (!userAnswers[userId]) {
      userAnswers[userId] = {};
    }

    // Store the answer
    userAnswers[userId][questionId] = isCorrect;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error storing answer:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to store answer", 
      details: (error as Error).message 
    }, { status: 500 });
  }
} 