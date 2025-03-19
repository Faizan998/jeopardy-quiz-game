'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Blog {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBlogs() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  // useEffect(() => {
  //   if (status === 'unauthenticated') {
  //     router.push('/login');
  //     return;
  //   }
    
  //   if (session?.user?.role !== 'ADMIN') {
  //     router.push('/admin-dashboard/blogs');
  //     return;
  //   }

  //   fetchBlogs();
  // }, [status, session, router]);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs');
      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }
      const data = await response.json();
      setBlogs(data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBlog = async (blogId: string, updatedData: Partial<Blog>) => {
    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        fetchBlogs();
        setEditingBlog(null);
      }
    } catch (error) {
      console.error('Error updating blog:', error);
    }
  };

  // if (status === 'loading' || loading) {
  //   return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  // }

  // if (session?.user?.role !== 'ADMIN') {
  //   return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Blogs</h1>
      
      <div className="space-y-6">
        {blogs.map((blog) => (
          <div key={blog.id} className="bg-white p-6 rounded-lg shadow">
            {editingBlog?.id === blog.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editingBlog.title}
                  onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Blog Title"
                />
                <textarea
                  value={editingBlog.content}
                  onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                  className="w-full p-2 border rounded h-32"
                  placeholder="Blog Content"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateBlog(blog.id, editingBlog)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingBlog(null)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
                <p className="text-gray-600 mb-4">{blog.content}</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date(blog.updatedAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => setEditingBlog(blog)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 