import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Fetch all categories (GET)
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }, // Optional: Order by category name
    });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// Create a new category (POST)
export async function POST(req: Request) {
  try {
    // Parse incoming request body as JSON
    const { name }: { name: string } = await req.json();
    
    // Check if the name is provided and not empty
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Create the new category
    const newCategory = await prisma.category.create({
      data: { name },
    });

    // Return the created category
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// Delete a category (DELETE)
export async function DELETE(req: Request) {
  try {
    // Extract category ID from the request body
    const { id }: { id: string } = await req.json();
    
    // Check if an ID was provided
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Attempt to delete the category from the database
    const deletedCategory = await prisma.category.delete({
      where: { id },
    });

    // Return success message
    return NextResponse.json(
      { message: 'Category deleted successfully', deletedCategory },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
