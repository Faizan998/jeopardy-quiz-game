import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import multer from 'multer';
import path from 'path';
import prisma from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

// Define the types for the blog data
type BlogData = {
  title: string;
  content: string;
  categoryId: string;  // Changed to categoryId
  filepath: string;
};

// Define the type for incoming form data (multipart/form-data)
type FormData = {
  title: string;
  content: string;
  category: string;  // The category name from the form
  image?: Express.Multer.File; // Multer file upload
};

// File upload configuration using multer
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size 5MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

// Helper function to process the file upload
const processUpload = async (req: Request): Promise<BlogData> => {
  const data = await req.formData();
  const file = data.get('image') as File;
  const title = data.get('title') as string;
  const content = data.get('content') as string;
  const category = data.get('category') as string;

  if (!file || !title || !content || !category) {
    throw new Error('All fields are required');
  }

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await writeFile(path.join(process.cwd(), 'public', '.gitkeep'), '');
  } catch (error) {
    // Directory already exists, continue
  }

  // Generate unique filename
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
  const filename = `blog-${uniqueSuffix}${path.extname(file.name)}`;

  // Convert file to buffer and save
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Save file to uploads directory
  const filepath = path.join(uploadsDir, filename);
  await writeFile(filepath, buffer);

  // Return data object with filepath and categoryId
  return {
    title,
    content,
    categoryId: category, // categoryId will be used here
    filepath: `/uploads/${filename}`,
  };
};

// POST API to create a new blog post
export async function POST(req: Request) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Process the upload (title, content, category, and file)
    const { title, content, categoryId, filepath } = await processUpload(req);

    // Find the category by ID (categoryId)
    const categoryRecord = await prisma.blogCategory.findUnique({
      where: { id: categoryId }, // Using categoryId to fetch the category
    });

    if (!categoryRecord) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    // Create a new blog post with the retrieved categoryId
    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        categoryId: categoryRecord.id, // Using categoryId from BlogCategory table
        imageUrl: filepath,
      },
    });

    return NextResponse.json(
      { message: 'Blog post created successfully', blog },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET API to fetch all blogs, including category data
export async function GET(req: Request) {
  try {
    const blogs = await prisma.blog.findMany({
      include: {
        category: true, // Include the related category data
      },
    });

    if (!blogs || blogs.length === 0) {
      return NextResponse.json({ message: 'Blogs not found' }, { status: 404 });
    }

    return NextResponse.json(blogs);
  } catch (error: any) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// PUT API to update a blog post
export async function PUT(req: Request) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { id, title, content, categoryId, imageUrl } = data;

    if (!id || !title || !content || !categoryId) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }

    // Update blog in the database
    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        title,
        content,
        categoryId, // Update categoryId
        imageUrl: imageUrl || blog.imageUrl, // Only update image if provided
      },
    });

    return NextResponse.json({ message: 'Blog updated successfully', updatedBlog });
  } catch (error: any) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE API to delete a blog post
export async function DELETE(req: Request) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { id } = data;

    if (!id) {
      return NextResponse.json({ message: 'Blog ID is required' }, { status: 400 });
    }

    // Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }

    // Delete blog from the database
    await prisma.blog.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
