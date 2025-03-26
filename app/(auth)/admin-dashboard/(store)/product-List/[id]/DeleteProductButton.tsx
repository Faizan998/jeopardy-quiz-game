'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type DeleteProductButtonProps = {
  productId: string;
};

export default function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      console.log('Attempting to delete product with ID:', productId);

      const response = await axios.delete(`/api/admin/store/product/${productId}`);

      // Axios throws an error automatically for non-2xx responses, so if we reach here, it's successful
      toast.success('Product deleted successfully!');
      router.push('/admin-dashboard/product-List');
      router.refresh();
    } catch (error) {
      console.error('Error deleting product:', error);
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'An error occurred while deleting the product';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <ToastContainer
         position="top-right"  // Set position to top-right
         autoClose={5000}  // Automatically close the toast after 5 seconds
         hideProgressBar={false}  // Show progress bar
         newestOnTop={false}  // Show the newest toast on the top
         closeOnClick
         rtl={false}  // For right-to-left languages, you can set this to true
         pauseOnFocusLoss
         draggable
         pauseOnHover
      />
      <button
        onClick={handleDeleteClick}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-red-300 transition-all duration-200"
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 animate-fade-in-up">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-all duration-200 disabled:bg-gray-300"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all duration-200 disabled:bg-red-300"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}