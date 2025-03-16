'use server';

import prisma from '@/app/lib/prisma';
import type { Blog } from '@/app/types/blog';

export async function getBlogs() {
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

    // Convert Date objects to strings for serialization
    return blogs.map(blog => ({
      ...blog,
      created_at: blog.created_at.toISOString(),
      updated_at: blog.updated_at.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
} 