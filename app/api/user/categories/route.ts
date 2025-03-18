import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";
import { decodeJwtToken } from "@/app/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    console.log("Categories API called");
    
    // Try to get token from NextAuth session
    const sessionToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    let userId = sessionToken?.sub;
    
    // If no session token, check for Authorization header
    if (!userId) {
      console.log("No session token, checking Authorization header");
      const authHeader = req.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("No Authorization header or invalid format");
        return NextResponse.json(
          { message: "Unauthorized" },
          { status: 401 }
        );
      }
      
      const tokenFromHeader = authHeader.split(" ")[1];
      console.log("Token from header:", tokenFromHeader.substring(0, 20) + "...");
      
      // Decode the token (simplified for this example)
      const decoded = decodeJwtToken(tokenFromHeader);
      
      if (!decoded) {
        console.log("Failed to decode token");
        return NextResponse.json(
          { message: "Invalid token format" },
          { status: 401 }
        );
      }
      
      // Try to extract user ID from various possible fields
      userId = decoded.userId || decoded.sub || decoded.id;
      
      if (!userId) {
        console.log("No user ID found in token");
        return NextResponse.json(
          { message: "Invalid token: no user ID" },
          { status: 401 }
        );
      }
      
      console.log("User ID from token:", userId);
    }
    
    // Get categories with their questions
    let categories = await prisma.category.findMany({
      include: {
        questions: true,
      },
    });
    
    // If no categories found, create mock data for testing
    if (categories.length === 0) {
      console.log("No categories found, creating mock data for testing");
      categories = [
        {
          id: "cat1",
          name: "History",
          created_at: new Date(),
          updated_at: new Date(),
          questions: [
            {
              id: "q1",
              value: "Who was the first President of the United States?",
              options: ["George Washington", "Thomas Jefferson", "Abraham Lincoln", "John Adams"],
              amount: 100,
              CorrectIdx: 0,
              categoryId: "cat1",
              created_at: new Date(),
              updated_at: new Date()
            },
            {
              id: "q2",
              value: "In which year did World War II end?",
              options: ["1943", "1944", "1945", "1946"],
              amount: 200,
              CorrectIdx: 2,
              categoryId: "cat1",
              created_at: new Date(),
              updated_at: new Date()
            }
          ]
        },
        {
          id: "cat2",
          name: "Science",
          created_at: new Date(),
          updated_at: new Date(),
          questions: [
            {
              id: "q3",
              value: "What is the chemical symbol for gold?",
              options: ["Go", "Gd", "Au", "Ag"],
              amount: 100,
              CorrectIdx: 2,
              categoryId: "cat2",
              created_at: new Date(),
              updated_at: new Date()
            },
            {
              id: "q4",
              value: "What is the closest planet to the Sun?",
              options: ["Venus", "Earth", "Mars", "Mercury"],
              amount: 200,
              CorrectIdx: 3,
              categoryId: "cat2",
              created_at: new Date(),
              updated_at: new Date()
            }
          ]
        }
      ];
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 