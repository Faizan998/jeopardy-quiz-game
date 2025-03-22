'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Blog } from '@/app/types'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { Category } from '../../../type/types';

// Function to fetch a single blog by ID
async function getBlogById(id: string): Promise<Blog | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/admin/blog/${id}`, {
      cache: 'no-store',
    })
    
    if (!res.ok) {
      throw new Error('Failed to fetch blog')
    }
    
    const data = await res.json()
    return data
  } catch (error) {
    console.error(`Error fetching blog with ID ${id}:`, error)
    return null
  }
}

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const id = params.id as string

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true)
      setError(null)
      const data = await getBlogById(id)

      if (data) {
        setBlog(data)
      } else {
        setError('Blog not found or an error occurred')
      }
      setLoading(false)
    }

    if (id) {
      fetchBlog()
    }
  }, [id])

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="mb-8 cursor-pointer flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Blog
        </button>

        {/* Loading or Error States */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-red-600">{error}</h2>
            <Link href="/blog">
              <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Go Back to Blog List
              </button>
            </Link>
          </div>
        )}

        {/* Blog Content */}
        {blog && !loading && !error && (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-4xl mx-auto">
            {/* Blog Image */}
            <div className="relative h-72 sm:h-96 w-full">
              <Image 
                src={blog.imageUrl || '/default-image.jpg'} 
                alt={blog.title}
                layout="fill"
                className="object-cover rounded-t-xl"
              />
            </div>

            {/* Blog Content */}
            <div className="p-8">
              <div className="mb-6">
                {/* Category Tag */}
                <span className="inline-block px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-full">
                  {blog.category?.name || 'Uncategorized'}
                </span>

                {/* Blog Title */}
                <h1 className="text-3xl font-bold mt-4 text-gray-800">{blog.title}</h1>
              </div>

              {/* Blog Content */}
              <div className="prose prose-lg max-w-none">
                {blog.content.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4 text-gray-700">{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Blog Found */}
        {!blog && !loading && !error && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700">Blog post not found</h2>
            <p className="text-gray-500 mt-2">The blog post you're looking for doesn't exist or has been removed</p>
            <Link href="/blog">
              <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                View All Blogs
              </button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
