import { NextResponse } from "next/server";
import { PrismaClient, Blog } from "@prisma/client";

const prisma = new PrismaClient();

// Define the expected shape of the request body for PUT
interface BlogRequest {
  title: string;
  content: string;
  imageUrl: string;
  categoryId: string;
}

// GET Blog API
export async function GET(req: Request, { params }: { params: { id: string } }): Promise<NextResponse> {
  const { id } = params; 

  try {
    const blog = await prisma.blog.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 });
  }
}  

// Update Blog API
export async function PUT(req: Request, { params }: { params: { id: string } }): Promise<NextResponse> {
  const { id } = params;
  const { title, content, imageUrl, categoryId }: BlogRequest = await req.json();

  try {
    const updatedBlog: Blog = await prisma.blog.update({
      where: { id },
      data: { title, content, imageUrl, categoryId },
    });

    return NextResponse.json(updatedBlog, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
  }
}
