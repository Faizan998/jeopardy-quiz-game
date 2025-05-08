import prisma from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

interface BlogUpdateRequest {
  title?: string;
  imageUrl?: string;
  content?: string;
  categoryId?: string;
}

// GET single blog by ID
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const blog = await prisma.blog.findUnique({
      where: {
        id: (await params).id,
      },
      include: {
        category: true,
      },
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({ error: 'Error fetching blog' }, { status: 500 });
  }
}

// UPDATE blog by ID
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body: BlogUpdateRequest = await req.json();
    const { title, imageUrl, content, categoryId } = body;

    // Check if blog exists
    const existingBlog = await prisma.blog.findUnique({
      where: { id: (await params).id },
    });

    if (!existingBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Update blog with provided fields
    const updatedBlog = await prisma.blog.update({
      where: { id: (await params).id },
      data: {
        title: title || existingBlog.title,
        imageUrl: imageUrl || existingBlog.imageUrl,
        content: content || existingBlog.content,
        categoryId: categoryId || existingBlog.categoryId,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json({ error: 'Error updating blog' }, { status: 500 });
  }
}

// DELETE blog by ID
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check if blog exists
    const existingBlog = await prisma.blog.findUnique({
      where: { id: (await params).id },
    });

    if (!existingBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Delete the blog
    await prisma.blog.delete({
      where: { id: (await params).id },
    });

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json({ error: 'Error deleting blog' }, { status: 500 });
  }
}