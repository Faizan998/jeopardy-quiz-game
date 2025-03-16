import { Metadata } from 'next';
import prisma from '@/app/lib/prisma';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Blog Posts',
  description: 'Read our latest blog posts',
};

export const dynamic = 'force-dynamic';

async function getBlogs() {
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

export default async function BlogsPage() {
  const blogs = await getBlogs();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Blog Posts</h1>
      
      {blogs.length === 0 ? (
        <p className="text-center text-gray-600">No blog posts available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <article
              key={blog.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48">
                <Image
                  src={blog.imageUrl}
                  alt={blog.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
                <p className="text-sm text-purple-600 mb-2">{blog.category}</p>
                <p className="text-gray-600 mb-4 line-clamp-3">{blog.content}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{blog.author.name}</span>
                  <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
} 