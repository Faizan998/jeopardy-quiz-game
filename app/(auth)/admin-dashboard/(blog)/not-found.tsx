import React from 'react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4">Blog Not Found</h2>
      <p className="text-gray-600 mb-8">The blog post you are looking for does not exist or has been removed.</p>
      <Link 
        href="/admin-dashboard/blogList"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Return to Blog List
      </Link>
    </div>
  )
} 