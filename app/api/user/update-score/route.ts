import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { decodeJwtToken } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

// Helper function to retry database operations
async function retryOperation<T>(operation: () => Promise<T>, maxRetries = 3, delay = 500): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.log(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error.message);
      
      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If we've exhausted all retries, throw the last error
  throw lastError;
}

export async function POST(req: NextRequest) {
  try {
    // Get user ID from token
    const sessionToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    let userId = sessionToken?.sub;
    
    // If no session token, check for Authorization header
    if (!userId) {
      const authHeader = req.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { message: "Unauthorized" },
          { status: 401 }
        );
      }
      
      const tokenFromHeader = authHeader.split(" ")[1];
      
      // Decode the token
      const decoded = decodeJwtToken(tokenFromHeader);
      
      if (!decoded) {
        return NextResponse.json(
          { message: "Invalid token format" },
          { status: 401 }
        );
      }
      
      // Try to extract user ID from various possible fields
      userId = decoded.userId || decoded.sub || decoded.id;
      
      if (!userId) {
        return NextResponse.json(
          { message: "Invalid token: no user ID" },
          { status: 401 }
        );
      }
    }
    
    // Parse request body
    const body = await req.json();
    const { questionId, isCorrect, points } = body;
    
    console.log("Update score request:", { userId, questionId, isCorrect, points, selectedIdx: body.selectedIdx });
    
    if (!questionId || typeof isCorrect !== 'boolean' || typeof points !== 'number') {
      console.log("Invalid request body:", { questionId, isCorrect, points });
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }
    
    // Update user score in database
    try {
      // First, check if this question has already been answered by this user
      const existingAnswer = await retryOperation(async () => {
        return await prisma.answer.findFirst({
          where: {
            userId,
            questionId
          }
        });
      });
      
      if (existingAnswer) {
        console.log(`Question ${questionId} already answered by user ${userId}`);
        // Question already answered, don't update score
        return NextResponse.json({
          message: "Question already answered",
          updated: false
        });
      }
      
      console.log(`Creating answer record for user ${userId}, question ${questionId}`);
      
      // Create answer record and update user's score in a transaction
      const result = await retryOperation(async () => {
        return await prisma.$transaction(async (tx) => {
          // Create answer record
          await tx.answer.create({
            data: {
              userId,
              questionId,
              isCorrect,
              pointsEarned: isCorrect ? points : 0,
              selectedIdx: body.selectedIdx?.toString() || "-1"
            }
          });
          
          // Update user's total score
          const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
              totalAmount: {
                increment: isCorrect ? points : 0
              }
            },
            select: {
              id: true,
              name: true,
              totalAmount: true,
              email: true
            }
          });
          
          return updatedUser;
        });
      });
      
      console.log(`Score updated for user ${userId}: ${isCorrect ? '+' + points : '0'} points. New total: ${result.totalAmount}`);
      
      // Create response with cache control headers
      const response = NextResponse.json({
        message: isCorrect ? `Correct answer! Added ${points} points.` : "Incorrect answer.",
        user: result,
        updated: true,
        pointsEarned: isCorrect ? points : 0,
        newTotal: result.totalAmount,
        timestamp: new Date().toISOString()
      });
      
      // Set cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      
      return response;
    } catch (dbError) {
      console.error("Database error when updating score:", dbError);
      
      // Store the answer in localStorage via the response
      // This allows the game to continue working offline
      return NextResponse.json({
        message: "Score update saved locally only. Database unavailable.",
        updated: false,
        error: dbError instanceof Error ? dbError.message : "Unknown database error",
        offlineData: {
          questionId,
          isCorrect,
          points: isCorrect ? points : 0,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error("Error updating score:", error);
    return NextResponse.json(
      { 
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 