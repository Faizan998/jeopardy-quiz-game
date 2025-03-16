import { NextResponse } from 'next/server';
import multer from 'multer';
import { writeFile } from 'fs/promises';
import path from 'path';
import prisma from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/authOptions';

// Configure multer for image upload
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG and WebP images are allowed'));
    }
  },
});

// Helper function to process upload with multer
const processUpload = async (req: Request) => {
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
  
  // Convert File to Buffer and save
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Save file to uploads directory
  const filepath = path.join(uploadsDir, filename);
  await writeFile(filepath, buffer);
  
  // Return the file path relative to public directory
  return {
    title,
    content,
    category,
    filepath: `/uploads/${filename}`,
  };
};

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

    // Process the upload
    const { title, content, category, filepath } = await processUpload(req);

    // Create blog post in database
    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        category,
        imageUrl: filepath,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
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

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json(blogs);
  } catch (error: any) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
} 