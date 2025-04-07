import prisma from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  try {
    const blogs = await prisma.blog.findMany({
      include: {
        category: true, // Changed from 'category' to match BlogCategory relation
      },
      orderBy: {
        created_at: 'desc', // Changed to match schema field name
      },
    });
    return NextResponse.json(blogs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching blogs' }, { status: 500 });
  }
}

interface BlogRequest {
  title: string;
  imageUrl: string; // Changed from 'image' to match schema
  content: string;
  categoryId: string;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body: BlogRequest = await req.json();
    const { title, imageUrl, content, categoryId } = body;

    // Validate fields
    if (!title || !imageUrl || !content || !categoryId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Create a new blog post
    const newBlog = await prisma.blog.create({
      data: {
        title,
        imageUrl, // Changed from 'image' to match schema
        content,
        categoryId,
        created_at: new Date(), // Explicitly setting created_at
      },
    });

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json({ error: 'Error creating blog' }, { status: 500 });
  }
}