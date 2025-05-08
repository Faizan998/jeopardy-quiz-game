'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Define TypeScript interfaces
interface Blog {
  id: string;
  title: string;
  imageUrl: string;
  content: string;
  categoryId: string;
}

export default function BlogUpdate() {
  const [formData, setFormData] = useState<Blog | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    fetchBlog();
  }, );

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${id}`);
      if (!response.ok) throw new Error('Failed to fetch blog');
      const data: Blog = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('Error fetching blog:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        router.push(`/blogs/${id}`);
      } else {
        throw new Error('Failed to update blog');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) =>
      prev ? { ...prev, [e.target.name]: e.target.value } : null
    );
  };

  if (!formData) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Update Blog</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <input
            type="text"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="Image URL"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Content"
            className="w-full p-2 border rounded h-48 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Update Blog
        </button>
      </form>
    </div>
  );
}