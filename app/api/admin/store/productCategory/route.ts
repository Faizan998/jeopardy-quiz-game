import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

// Type definitions
interface CategoryData {
  name: string;
}

interface CategoryResponse {
  message?: string;
  category?: any;
  error?: string;
}

interface CategoryListResponse {
  data: any[];
  error?: string;
}

// POST - Create a new category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = body as CategoryData;

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    const newCategory = await prisma.productCategory.create({
      data: { name },
    });

    return NextResponse.json(newCategory, { status: 200 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// GET - Fetch all categories
export async function GET(req: NextRequest) {
  try {
    const allCategories = await prisma.productCategory.findMany();
    return NextResponse.json(
      { data: allCategories },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

