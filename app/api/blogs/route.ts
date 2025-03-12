import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { writeFile } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Multer configuration for image upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const article = formData.get('article') as string;
    const image = formData.get('image') as File | null;

    let imageUrl = '';
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const filename = `${Date.now()}-${image.name}`;
      const filePath = path.join(process.cwd(), 'public/uploads', filename);
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    const newBlog = await prisma.blog.create({
      data: {
        title,
        category,
        article,
        imageUrl,
      },
    });

    return NextResponse.json({ message: 'Blog uploaded successfully', blog: newBlog }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error uploading blog', error }, { status: 500 });
  }
}

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany();
    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching blogs', error }, { status: 500 });
  }
}
