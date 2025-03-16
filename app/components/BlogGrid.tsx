"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Blog } from '@/app/types/blog';

export interface BlogGridProps {
  blogs: Blog[];
}

export default function BlogGrid({ blogs }: BlogGridProps) {
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!blogs || blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl text-gray-600">No blog posts found</h3>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <motion.div
            key={blog.id}
            layoutId={`blog-${blog.id}`}
            onClick={() => setSelectedBlog(blog)}
            className="cursor-pointer bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105"
            whileHover={{ y: -5 }}
          >
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {blog.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{blog.category}</p>
              <p className="text-gray-700 line-clamp-3">{blog.content}</p>
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-500">{blog.author.name}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(blog.created_at)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedBlog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBlog(null)}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              layoutId={`blog-${selectedBlog.id}`}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedBlog.imageUrl}
                alt={selectedBlog.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  {selectedBlog.title}
                </h2>
                <div className="flex items-center justify-between mb-6">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    {selectedBlog.category}
                  </span>
                  <div className="text-gray-600 text-sm">
                    By {selectedBlog.author.name} •{' '}
                    {formatDate(selectedBlog.created_at)}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedBlog.content}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 