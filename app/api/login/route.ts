import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; 
import jwt from "jsonwebtoken";
import prisma from "@/app/lib/prisma"; // Ensure this path is correct

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    console.log("Received Login Request for:", email); // Log email

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error("User not found:", email);
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    console.log("User Found:", user); // Log user info (excluding password)

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error("Invalid password for:", email);
      return NextResponse.json({ message: "Invalid password" }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: "1h" }
    );

    console.log("Login successful for:", email);

    return NextResponse.json({ token, role: user.role, name: user.name }, { status: 200 });
  } catch (error) {
    console.error("Login API Error:", error); // Log full error
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
