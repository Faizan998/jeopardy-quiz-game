import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import prisma from '@/app/lib/prisma';
import fs from 'fs';
import { NextRequest } from 'next/server';

// Define the shape of the request body
interface BlogPostData {
  title: string;
  content: string;
  categoryId: string;
  imageUrl: string;
}

// Ensure uploads directory exists
async function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await fs.promises.access(uploadsDir);
  } catch (error) {
    // Directory doesn't exist, create it
    await mkdir(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

// Helper function to directly parse the FormData
async function parseFormData(req: NextRequest): Promise<BlogPostData> {
  try {
    // Ensure uploads directory exists
    const uploadsDir = await ensureUploadsDir();
    
    // Parse the request as FormData
    //Faizan
    const formData = await req.formData();
    
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const categoryId = formData.get('categoryId') as string;
    const imageFile = formData.get('image') as File;
    
    console.log('Form data received:', { 
      title: title ? 'present' : 'missing', 
      content: content ? 'present' : 'missing', 
      categoryId: categoryId ? 'present' : 'missing',
      image: imageFile ? 'present' : 'missing' 
    });
    
    // Validate required fields
    if (!title || !content || !categoryId || !imageFile) {
      throw new Error('All fields (title, content, categoryId, image) are required.');
    }
    
    // Get the file buffer
    const fileBuffer = await imageFile.arrayBuffer();
    
    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const extension = imageFile.name.split('.').pop() || 'jpg';
    const filename = `blog-${uniqueSuffix}.${extension}`;
    const filepath = path.join(uploadsDir, filename);
    
    // Write the file to disk
    await writeFile(filepath, new Uint8Array(fileBuffer));
    
    return {
      title,
      content,
      categoryId,
      imageUrl: `/uploads/${filename}`,
    };
  } catch (error) {
    console.error('Error parsing form data:', error);
    throw error;
  }
}

// API Route for POST (creating a blog post)
export async function POST(req: NextRequest) {
  try {
    // Use direct FormData parsing
    const { title, content, categoryId, imageUrl } = await parseFormData(req);
    
    // Check if the category exists in the database
    const categoryRecord = await prisma.blogCategory.findUnique({
      where: { id: categoryId },
    });

    if (!categoryRecord) {
      return new NextResponse(
        JSON.stringify({ message: 'Category not found' }),
        { status: 404 }
      );
    }

    // Create the new blog post in the database
    const newBlog = await prisma.blog.create({
      data: {
        title,
        content,
        imageUrl, // Store the image path
        categoryId, // Store the category ID
      },
      include: {
        category: true, // Optional: Include category data in the response
      },
    });

    // Return success response with the created blog data
    return new NextResponse(
      JSON.stringify({ message: 'Blog post created successfully', blog: newBlog }),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return new NextResponse(
      JSON.stringify({ message: error.message || 'Internal server error' }),
      { status: 500 }
    );
  }
}

// GET all blog posts
export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      include: {
        category: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return new NextResponse(
      JSON.stringify(blogs),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Failed to fetch blogs' }),
      { status: 500 }
    );
  }
}

// DELETE a blog post (legacy support for requests with ID in body)
export async function DELETE(req: NextRequest) {
  try {
    // Extract blog ID from the request body
    const { id } = await req.json();
    
    if (!id) {
      return new NextResponse(
        JSON.stringify({ message: 'Blog ID is required' }),
        { status: 400 }
      );
    }

    // Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      return new NextResponse(
        JSON.stringify({ message: 'Blog not found' }),
        { status: 404 }
      );
    }

    // Delete the associated image if it exists
    if (blog.imageUrl && blog.imageUrl.startsWith('/uploads/')) {
      const imagePath = path.join(process.cwd(), 'public', blog.imageUrl);
      try {
        await fs.promises.access(imagePath);
        await fs.promises.unlink(imagePath);
      } catch (error) {
        console.error('Failed to delete image:', error);
        // Continue with blog deletion even if image deletion fails
      }
    }

    // Delete the blog post from the database
    const deletedBlog = await prisma.blog.delete({
      where: { id },
    });

    return new NextResponse(
      JSON.stringify({ message: 'Blog deleted successfully', blog: deletedBlog }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting blog:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Failed to delete blog' }),
      { status: 500 }
    );
  }
}

// PUT to update a blog post
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const categoryId = formData.get('categoryId') as string;
    const imageFile = formData.get('image') as File | null;
    
    // Validate required fields
    if (!id || !title || !content || !categoryId) {
      return new NextResponse(
        JSON.stringify({ message: 'ID, title, content, and categoryId are required' }),
        { status: 400 }
      );
    }

    // Check if blog exists
    const existingBlog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      return new NextResponse(
        JSON.stringify({ message: 'Blog not found' }),
        { status: 404 }
      );
    }

    // Check if the category exists
    const categoryRecord = await prisma.blogCategory.findUnique({
      where: { id: categoryId },
    });

    if (!categoryRecord) {
      return new NextResponse(
        JSON.stringify({ message: 'Category not found' }),
        { status: 404 }
      );
    }

    let imageUrl = existingBlog.imageUrl;

    // Handle new image upload if provided
    if (imageFile) {
      // Ensure uploads directory exists
      const uploadsDir = await ensureUploadsDir();
      
      // Delete the old image if it exists
      if (existingBlog.imageUrl && existingBlog.imageUrl.startsWith('/uploads/')) {
        const oldImagePath = path.join(process.cwd(), 'public', existingBlog.imageUrl);
        try {
          await fs.promises.access(oldImagePath);
          await fs.promises.unlink(oldImagePath);
        } catch (error) {
          console.error('Failed to delete old image:', error);
          // Continue even if old image deletion fails
        }
      }
      
      // Get the file buffer
      const fileBuffer = await imageFile.arrayBuffer();
      
      // Create a unique filename
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const extension = imageFile.name.split('.').pop() || 'jpg';
      const filename = `blog-${uniqueSuffix}.${extension}`;
      const filepath = path.join(uploadsDir, filename);
      
      // Write the file to disk
      await writeFile(filepath, new Uint8Array(fileBuffer));
      
      // Update the image URL
      imageUrl = `/uploads/${filename}`;
    }

    // Update the blog post in the database
    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        title,
        content,
        imageUrl,
        categoryId,
        updated_at: new Date(),
      },
      include: {
        category: true,
      },
    });

    // Return success response with the updated blog data
    return new NextResponse(
      JSON.stringify({ message: 'Blog post updated successfully', blog: updatedBlog }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return new NextResponse(
      JSON.stringify({ message: error.message || 'Internal server error' }),
      { status: 500 }
    );
  }
}
