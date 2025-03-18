import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    // Try to connect to the database
    await prisma.$connect();
    
    // Try a simple query to verify the connection
    const count = await prisma.user.count();
    
    return NextResponse.json({
      status: "ok",
      message: "Database connection successful",
      databaseStatus: "connected",
      userCount: count,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Health check failed:", error);
    
    return NextResponse.json({
      status: "error",
      message: "Database connection failed",
      databaseStatus: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 200 }); // Still return 200 so the client can display the error
  }
} 