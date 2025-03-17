import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/app/lib/prisma"; // Ensure correct path


export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    console.log("Received Login Request for:", email);

    if (!email || !password) {
      console.error("Missing email or password");
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    let user;
    let usingMockData = false;

    try {
      // Try to find user in database
      user = await prisma.user.findUnique({
        where: { email },
      });
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      
      
      if (user) {
        console.log("Database unavailable, using mock user data for:", email);
        usingMockData = true;
      } else {
        return NextResponse.json({ 
          message: "Database connection error. Please try again later.",
          error: String(dbError)
        }, { status: 500 });
      }
    }

    if (!user) {
      console.error("User not found:", email);
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    console.log("User Found:", { id: user.id, email: user.email, role: user.role });

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password as string);
    
    console.log("Password Match Result:", isMatch);

    if (!isMatch) {
      console.error("Invalid password for:", email);
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET_KEY || "fallback-secret-key-for-development-only",
      { expiresIn: "1h" }
    );

    console.log("Login successful for:", email);

    if (usingMockData) {
      console.log("Using mock data - in a production environment, this would use real database data");
    }

    return NextResponse.json({ 
      token, 
      role: user.role, 
      name: user.name,
      usingMockData
    }, { status: 200 });
  } catch (error: any) {
    console.error("Login API Error:", error.message || error);
    return NextResponse.json({ 
      message: "Internal Server Error", 
      error: error.message || "Unknown error" 
    }, { status: 500 });
  }
}