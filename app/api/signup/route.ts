import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma"; // Ensure Prisma is set up properly

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Validate input fields
    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Check if user already exists
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ message: "User already exists" }, { status: 400 });
      }
    } catch (dbError: any) {
      console.error("Database error checking existing user:", dbError);
      return NextResponse.json({ 
        message: "Error checking user existence", 
        error: "Database connection issue" 
      }, { status: 500 });
    }

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashError: any) {
      console.error("Password hashing error:", hashError);
      return NextResponse.json({ 
        message: "Error processing password", 
        error: "Password hashing failed" 
      }, { status: 500 });
    }

    // Create new user
    try {
      const newUser = await prisma.user.create({
        data: { 
          name, 
          email, 
          password: hashedPassword, 
          role: "USER",
          resetToken: null,  // Set to null instead of empty string
          resetTokenExpiry: null
        },
      });

      return NextResponse.json({ 
        message: "Signup successful", 
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      }, { status: 201 });
    } catch (createError: any) {
      console.error("User creation error:", createError);
      return NextResponse.json({ 
        message: "Failed to create user", 
        error: createError.message || "Database error" 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ 
      message: "Internal Server Error", 
      error: "An unexpected error occurred" 
    }, { status: 500 });
  }
}
