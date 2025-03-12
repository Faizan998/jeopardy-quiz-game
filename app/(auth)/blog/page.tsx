'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    fetch('/api/blog')
      .then((res) => res.json())
      .then((data) => setBlogs(data.blogs))
      .catch((error) => console.error('Error fetching blogs:', error));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Blogs</h1>
      {selectedBlog ? (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <button onClick={() => setSelectedBlog(null)} className="text-red-500 mb-4">Close</button>
          {selectedBlog.imageUrl && (
            <Image src={selectedBlog.imageUrl} alt={selectedBlog.title} width={600} height={400} className="rounded-lg mb-4" />
          )}
          <h2 className="text-2xl font-bold">{selectedBlog.title}</h2>
          <p className="text-sm text-gray-600 mb-2">Category: {selectedBlog.category}</p>
          <p className="text-gray-700">{selectedBlog.article}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white p-4 rounded-lg shadow-md cursor-pointer"
              onClick={() => setSelectedBlog(blog)}
            >
              {blog.imageUrl && (
                <Image src={blog.imageUrl} alt={blog.title} width={300} height={200} className="rounded-lg mb-3" />
              )}
              <h3 className="text-xl font-semibold">{blog.title}</h3>
              <p className="text-sm text-gray-600">Category: {blog.category}</p>
              <p className="text-gray-700 mt-2">{blog.article.slice(0, 100)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}