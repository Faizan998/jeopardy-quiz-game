import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";
import { decodeJwtToken } from "@/app/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    console.log("Profile API called");
    
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

    // For testing purposes, if no user is found, create a mock user
    // REMOVE THIS IN PRODUCTION
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        totalAmount: true,
        role: true,
      },
    });

    if (!user) {
      console.log("User not found, creating mock user for testing");
      // For testing only - create a mock user
      user = {
        id: userId,
        name: "Test User",
        email: "test@example.com",
        totalAmount: 500,
        role: "USER"
      };
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 