import React from 'react'
import { Blog } from '@/app/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DeleteBlogButton from './DeleteBlogButton'

// Define the page props type
type PageProps = {
  params: {
    id: string
  }
}

// Fetch blog data server-side
async function getBlog(id: string): Promise<Blog | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/admin/blog/${id}`, {
      cache: 'no-store',
    })
    
    if (!res.ok) {
      return null
    }
    
    return res.json()
  } catch (error) {
    console.error('Error fetching blog:', error)
    return null
  }
}

export default async function BlogDetailsPage({ params }: PageProps) {
  const blog = await getBlog(params.id)
  
  if (!blog) {
    return notFound()
  }
  
  return (
    <div className="flex justify-center items-center min-h-screen px-4 py-8">
      {/* Container for the Card */}
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full sm:w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12 p-6">
        
        {/* Blog Image */}
        {blog.imageUrl && (
          <div className="mb-4">
            <img 
              src={blog.imageUrl} 
              alt={blog.title} 
              className="w-full h-64 object-cover rounded-t-lg mb-4"
            />
          </div>
        )}

        {/* Category Section */}
        <div className="mb-4">
          <p className="text-lg text-gray-600">
            <strong>Category:</strong> {blog.category?.name || 'Uncategorized'}
          </p>
        </div>

        {/* Title Section */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">{blog.title}</h1>
        </div>

        {/* Blog Content */}
        <div className="prose max-w-none mb-4 text-base text-gray-700" dangerouslySetInnerHTML={{ __html: blog.content }} />
        
        {/* Published Date */}
        <div className="mb-4">
          <p className="text-md text-gray-500">
            <strong>Published:</strong> {new Date(blog.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-4">
          <Link 
            href={`/admin-dashboard/blogList`}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back 
          </Link>
          <Link 
            href={`/admin-dashboard/${params.id}/update`}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Edit
          </Link>
          <DeleteBlogButton blogId={params.id} />
        </div>

      </div>
    </div>
  )
}
