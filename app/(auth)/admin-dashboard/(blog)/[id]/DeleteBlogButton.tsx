'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

type DeleteBlogButtonProps = {
  blogId: string
}

export default function DeleteBlogButton({ blogId }: DeleteBlogButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const router = useRouter()

  const handleDeleteClick = () => {
    setShowConfirmation(true)
  }

  const cancelDelete = () => {
    setShowConfirmation(false)
  }

  const confirmDelete = async () => {
    try {
      setIsDeleting(true)
      
      const response = await fetch(`/api/admin/blog`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: blogId }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete blog')
      }

      // Navigate back to blog list after successful deletion
      router.push('/admin-dashboard/blog-List')
      router.refresh()
    } catch (error) {
      console.error('Error deleting blog:', error)
      alert('Failed to delete blog')
    } finally {
      setIsDeleting(false)
      setShowConfirmation(false)
    }
  }

  return (
    <>
      <button 
        onClick={handleDeleteClick}
        className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-red-300"
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold text-black mb-4">Confirm Delete</h3>
            <p className="mb-6 text-black ">Are you sure you want to delete this blog post? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={cancelDelete}
                className=" px-4 py-2 border cursor-pointer bg-gray-500 border-gray-300 rounded"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 cursor-pointer bg-red-500 text-white rounded"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 