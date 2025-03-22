import React from 'react'
import { notFound } from 'next/navigation'
import { Blog } from '@/app/types'
import UpdateBlogForm from './UpdateBlogForm'
import Link from 'next/link'

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

// Fetch blog categories for the form
async function getCategories() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/admin/blogCategory`, {
      cache: 'no-store',
    })
    
    if (!res.ok) {
      return []
    }
    
    return res.json()
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function UpdateBlogPage({ params }: PageProps) {
  const blog = await getBlog(params.id)
  const categories = await getCategories()
  
  if (!blog) {
    return notFound()
  }
  
  return (
    <div className="flex justify-center items-center min-h-screen px-4 py-8">
      {/* Container for the Card */}
      <div className="bg-white rounded-lg shadow-md p-6 w-full sm:w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Update Blog Post</h1>
          <Link 
            href={`/admin-dashboard/${params.id}`}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </Link>
        </div>
        
        <UpdateBlogForm blog={blog} categories={categories} />
      </div>
    </div>
  )
}
