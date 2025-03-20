import prisma from "@/lib/prisma"; // ✅ Ensure correct import path
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions); // Retrieve the current session
    if (!session) {
      // If no session, return unauthorized
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the authenticated user is an admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can view users" },
        { status: 403 }
      );
    }

    // Fetch all users if the session is valid and user is an admin
    const users = await prisma.user.findMany({omit: {password: true}}); // Fetch all users

    // Check if users exist
    if (!users || users.length === 0) {
      return NextResponse.json({ message: "No users found" }, { status: 404 });
    }

    // Return the list of users
    return NextResponse.json({ message: "Users found", users: users }, {
      status: 200
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Internal Server Error" }, {
      status: 500
    });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions); // Retrieve the current session
    if (!session) {
      // If no session, return unauthorized
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure that only an admin can delete users
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can delete users" },
        { status: 403 }
      );
    }

    const { email } = await req.json(); // Expect email to be sent in the request body

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Check if the user exists before attempting to delete
    const existingUser = await prisma.user.findUnique({
      where: { email ,role: "USER" },
      select: { id: true } // Check if the user exists by their email
    });

    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Delete the user from the database
    await prisma.user.delete({
      where: { email ,role: "USER" }
    });

    return NextResponse.json({ message: "User deleted successfully" }, {
      status: 200
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ message: "Internal Server Error" }, {
      status: 500
    });
  }
}
