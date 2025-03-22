import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'

type ParamsType = {
  params: {
    id: string
  }
}

// GET a single blog by ID
export async function GET(request: Request, { params }: ParamsType) {
  try {
    // Await params before accessing its properties
    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams.id
    
    if (!id) {
      return new NextResponse(
        JSON.stringify({ message: 'Blog ID is required' }),
        { status: 400 }
      )
    }
    
    // Fetch the blog with its category
    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        category: true,
      },
    })
    
    if (!blog) {
      return new NextResponse(
        JSON.stringify({ message: 'Blog not found' }),
        { status: 404 }
      )
    }
    
    return new NextResponse(
      JSON.stringify(blog),
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching blog by ID:', error)
    return new NextResponse(
      JSON.stringify({ message: 'Failed to fetch blog' }),
      { status: 500 }
    )
  }
} 