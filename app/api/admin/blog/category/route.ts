import { NextResponse } from "next/server";
import { PrismaClient, Category } from "@prisma/client";

const prisma = new PrismaClient();

// Define types for the request body for POST and DELETE
interface CreateCategoryRequest {
  name: string;
}

interface DeleteCategoryRequest {
  id: string;
}

// Fetch all categories (GET)
export async function GET(): Promise<NextResponse> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }, // Optional: Order by category name
    });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// Create a new category (POST)
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { name }: CreateCategoryRequest = await req.json(); // Extract name from request body
    const newCategory: Category = await prisma.category.create({
      data: { name },
    });
    return NextResponse.json(newCategory, { status: 200 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

// Delete a category (DELETE)
export async function DELETE(req: Request): Promise<NextResponse> {
  try {
    const { id }: DeleteCategoryRequest = await req.json(); // Extract category ID from request body
    await prisma.category.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
