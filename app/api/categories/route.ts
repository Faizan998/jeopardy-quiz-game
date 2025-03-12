import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch all categories with their questions
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        questions: { select: { id: true, value: true } }, // Fetch questions under category (using 'value' instead of 'text')
      },
    });

    return NextResponse.json({ success: true, data: categories }, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST: Add a new category
export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: { name },
    });

    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });
  } catch (error) {
    console.error("Error adding category:", error);
    return NextResponse.json({ success: false, error: "Failed to add category" }, { status: 500 });
  }
}
