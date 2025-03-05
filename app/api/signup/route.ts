import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma"; // Ensure Prisma is set up properly

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Validate fields
    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }
    console.log("user Existing", existingUser);
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in the database
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "USER" },
    });
    console.log("user Existing", newUser);
    return NextResponse.json({ message: "Signup successful", user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
