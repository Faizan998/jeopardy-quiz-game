import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/app/lib/prisma"; // ✅ Ensure correct import

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Only check email when finding existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { email: true }
    });

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        role: "USER"
      },
      // Only select necessary fields for response
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
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
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}