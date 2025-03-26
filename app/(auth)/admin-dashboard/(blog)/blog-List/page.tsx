import React from 'react'
import Link from 'next/link'
import { Blog } from '@/app/types'

// Fetch all blogs from the API
async function getBlogs(): Promise<{ blogs: Blog[], error?: string }> {
  try {
    // Use absolute URL for server-side fetching
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/admin/blog`, {
      cache: 'no-store',
    })
    
    if (!res.ok) {
      const errorData = await res.json();
      return { 
        blogs: [],
        error: errorData.message || `Failed to fetch blogs: ${res.status}`
      }
    }
    
    return { blogs: await res.json() }
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return { 
      blogs: [], 
      error: error instanceof Error ? error.message : 'Failed to connect to the database'
    }
  }
}

export default async function BlogListPage() {
  const { blogs, error } = await getBlogs()
  
  return (
    <div className="container mx-auto px-4 bg-gradient-to-r from-blue-900 to-blue-600 dark:bg-blue-500 text-white transition-all duration-300 ease-in-out py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Link 
          href="/admin-dashboard/createBlog"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Blog
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <p className="mt-2">
            Please check your database connection or try again later. If the problem persists, contact support.
          </p>
        </div>
      )}

      {blogs.length === 0 && !error ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No blog posts found. Create a new one!</p>
        </div>
      ) :
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:scale-105"
            >
              {/* Display the image if available */}
              {blog.imageUrl && (
                <img 
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-full h-48 object-cover rounded-t-lg mb-4"
                />
              )}
              
              {/* Category Section - Position swapped */}
              <p className="text-md text-black-800 mb-2">
                <strong>Category:</strong> {blog.category?.name || 'Uncategorized'}
              </p>
              
              {/* Title Section */}
              <h2 className="text-md font-semibold text-gray-700 mb-4">{blog.title}</h2>
              
              {/* Created At Section */}
              <p className="text-sm text-gray-500 mb-4">
                Created on {new Date(blog.created_at).toLocaleDateString()}
              </p>
              
              {/* Action Links */}
              <div className="flex justify-between">
                <Link 
                  href={`/admin-dashboard/${blog.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  View
                </Link>
                
                <Link 
                  href={`/admin-dashboard/${blog.id}/update`}
                  className="text-green-600 hover:text-green-900"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  )
}
