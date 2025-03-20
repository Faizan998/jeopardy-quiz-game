import { NextResponse } from 'next/server';
import { PrismaClient, Blog } from '@prisma/client';

const prisma = new PrismaClient();

// Type definition for the expected request body for POST and PUT
interface BlogRequest {
    id: string;
  title: string;
  content: string;
  imageUrl: string;
  categoryId: string;
}

// Create a blog (POST)
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { title, content, imageUrl,categoryId }: BlogRequest = await req.json();
    
    const newBlog: Blog = await prisma.blog.create({
      data: { title, content, imageUrl,categoryId },
    });

    return NextResponse.json(newBlog, { status: 200 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}

// Fetch blogs or a single blog by ID (GET)
export async function GET(req: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      // If your blog id is numeric, uncomment the next line
      // const numericId = parseInt(id, 10);
      const blog = await prisma.blog.findUnique({
        where: { id },
        include: { category: true },
      });

      if (!blog) {
        return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
      }
      return NextResponse.json(blog, { status: 200 });
    } else {
      const blogs: Blog[] = await prisma.blog.findMany({
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(blogs, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

// Update a blog (PUT)
export async function PUT(req: Request): Promise<NextResponse> {
  try {
    const { id, title, content, imageUrl, categoryId }: BlogRequest = await req.json();

    const updatedBlog: Blog = await prisma.blog.update({
      where: { id },
      data: { title, content, imageUrl, categoryId },
    });

    return NextResponse.json(updatedBlog, { status: 200 });
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
}

// Delete a blog (DELETE)
export async function DELETE(req: Request): Promise<NextResponse> {
  try {
    const { id }: { id: string } = await req.json();
    
    await prisma.blog.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Blog deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
