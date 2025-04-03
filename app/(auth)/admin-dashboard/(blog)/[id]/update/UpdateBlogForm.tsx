'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Blog, BlogCategory } from '@/app/types'

type UpdateBlogFormProps = {
  blog: Blog
  categories: BlogCategory[]
}

export default function UpdateBlogForm({ blog, categories }: UpdateBlogFormProps) {
  const [title, setTitle] = useState(blog.title)
  const [content, setContent] = useState(blog.content)
  const [categoryId, setCategoryId] = useState(blog.categoryId)
  const [image, setImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(blog.imageUrl)
  
  const router = useRouter()

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      
      // Create a preview URL for the selected image
      const objectUrl = URL.createObjectURL(file)
      setPreviewImage(objectUrl)
      
      // Clean up the URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!title.trim() || !content.trim() || !categoryId) {
      setError('Please fill in all required fields')
      return
    }
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Create a FormData object to handle file uploads
      const formData = new FormData()
      formData.append('id', blog.id)
      formData.append('title', title)
      formData.append('content', content)
      formData.append('categoryId', categoryId)
      
      // Only append image if a new one was selected
      if (image) {
        formData.append('image', image)
      }
      
      // Send the update request
      const response = await fetch('/api/admin/blog', {
        method: 'PUT',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update blog')
      }
      
      // Navigation after successful update
      router.push(`/admin-dashboard/${blog.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error updating blog:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category *
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Content *
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        ></textarea>
      </div>
      
      <div>
        <label htmlFor="image" className="block text-sm text-black font-medium mb-1">
          Image
        </label>
        <input
          type="file"
          id="image"
          onChange={handleImageChange}
          accept="image/*"
          className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">
          Leave empty to keep the current image
        </p>
      </div>
      
      {/* Image preview */}
      {previewImage && (
        <div className="mt-2">
          <p className="text-sm font-medium  text-gray-700 mb-1">Image Preview</p>
          <img
            src={previewImage}
            alt="Preview"
            className="h-64 object-cover rounded border border-gray-300"
          />
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Updating...' : 'Update Blog'}
        </button>
      </div>
    </form>
  )
} 