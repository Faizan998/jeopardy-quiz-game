'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Blog } from '@/app/types'
import { motion } from 'framer-motion'

// Function to fetch all blogs
async function getBlogs(): Promise<Blog[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/admin/blog`, {
      cache: 'no-store',
    })
    
    if (!res.ok) {
      return []
    }
    
    const data = await res.json()
    return data
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return []
  }
}

// Function to truncate text
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true)
      const data = await getBlogs()
      setBlogs(data)
      setLoading(false)
    }

    fetchBlogs()
  }, [])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Our Blog</h1>
        <Link href="/">
          <button className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Home
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <Link href={`/blog/${blog.id}`} key={blog.id}>
              <motion.div 
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative h-48 w-full">
                  <Image 
                    src={blog.imageUrl || '/jeopardy-background-1000-x-1500-uhc9qo2xvatpslaz.jpg'} 
                    alt={blog.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-2">
                    <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                      {blog.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mb-3 text-gray-800">{blog.title}</h2>
                  <p className="text-gray-600 mb-4 flex-grow">
                    {truncateText(blog.content, 120)}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    {/* <span>{new Date(blog.created_at).toLocaleDateString()}</span> */}
                    <span className="text-blue-600 font-medium">Read More →</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
      
      {!loading && blogs.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700">No blog posts found</h2>
          <p className="text-gray-500 mt-2">Check back later for new content</p>
        </div>
      )}
    </div>
  )
}
