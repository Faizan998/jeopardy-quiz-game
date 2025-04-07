'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define TypeScript interfaces
interface BlogCategory {
  name: string;
}

interface Blog {
  id: string;
  title: string;
  imageUrl: string;
  content: string;
  created_at: string;
  category: BlogCategory;
}

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs');
      if (!response.ok) throw new Error('Failed to fetch blogs');
      const data: Blog[] = await response.json();
      setBlogs(data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  const handleCardClick = (id: string) => {
    router.push(`/blogs/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleCardClick(blog.id)}
          >
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
            <p className="text-gray-600 mb-2">{blog.category.name}</p>
            <p className="text-sm text-gray-500">
              {new Date(blog.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}