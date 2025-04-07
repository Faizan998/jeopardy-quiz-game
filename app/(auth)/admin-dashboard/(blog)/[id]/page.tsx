'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

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

export default function BlogDetail() {
  const [blog, setBlog] = useState<Blog | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${id}`);
      if (!response.ok) throw new Error('Failed to fetch blog');
      const data: Blog = await response.json();
      setBlog(data);
    } catch (error) {
      console.error('Error fetching blog:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this blog?')) {
      try {
        const response = await fetch(`/api/blogs/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          router.push('/blogs');
        } else {
          throw new Error('Failed to delete blog');
        }
      } catch (error) {
        console.error('Error deleting blog:', error);
      }
    }
  };

  const handleUpdate = () => {
    router.push(`/blogs/${id}/edit`);
  };

  if (!blog) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <img
        src={blog.imageUrl}
        alt={blog.title}
        className="w-full h-96 object-cover rounded-lg mb-6"
      />
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
      <p className="text-gray-600 mb-2">Category: {blog.category.name}</p>
      <p className="text-gray-500 mb-6">
        Date:In {new Date(blog.created_at).toLocaleDateString()}
      </p>
      <div className="prose max-w-none mb-8">{blog.content}</div>
      <div className="flex gap-4">
        <button
          onClick={handleUpdate}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Update Blog
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Delete Blog
        </button>
      </div>
    </div>
  );
}