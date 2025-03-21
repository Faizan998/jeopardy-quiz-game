"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

// Define the structure of a Blog
interface Blog {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  category?: { name: string };
}

export default function BlogDetail() {
 
  const [blog, setBlog] = useState<Blog | null>(null); // Blog data state, typed
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    
    const fetchBlog = async () => {
      try {
        const response = await axios.get<Blog>(`/api/admin/blog`); // Typed API response
        setBlog(response.data);
      } catch (err: any) {
        setError(err.response?.status === 404 ? "Blog not found" : "Failed to fetch blog");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mt-6 mb-6">{blog?.title}</h1>
      <img
        src={blog?.imageUrl} // Fallback image if imageUrl is missing
        alt={blog?.title}
        className="w-full h-64 object-cover rounded-lg shadow-md"
      />
      <span className="mt-4 inline-block bg-blue-100 text-blue-600 text-sm font-medium px-3 py-1 rounded-full">
        {blog?.category?.name || "Uncategorized"}
      </span>
      <p className="text-gray-600 mt-4">{blog?.content}</p>

      {/* Optional edit button, depending on user permissions */}
      {blog && (
        <Link href={`/auth/admin-dashboard/blog/${blog.id}/update`} legacyBehavior>
          <a className="bg-green-500 text-white px-3 py-1 rounded mt-2 inline-block">Edit</a>
        </Link>
      )}
    </div>
  );
}
