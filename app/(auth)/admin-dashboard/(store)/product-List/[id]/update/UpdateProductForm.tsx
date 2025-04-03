'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductCategory } from '@/app/type/types'; // Adjust import path as needed
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type UpdateProductFormProps = {
  product: Product;
  categories: ProductCategory[];
};

export default function UpdateProductForm({ product, categories }: UpdateProductFormProps) {
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [basePrice, setBasePrice] = useState(product.basePrice.toString());
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(product.imageUrl);

  const router = useRouter();

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      // Create a preview URL for the selected image
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);

      // Clean up the URL when component unmounts (handled by useEffect cleanup)
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!title.trim() || !description.trim() || !categoryId || !basePrice.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create a FormData object to handle file uploads
      const formData = new FormData();
      const productData = {
        id: product.id,
        title,
        description,
        categoryId,
        basePrice,
      };
      formData.append('product', JSON.stringify(productData));

      // Only append image if a new one was selected
      if (image) {
        formData.append('image', image);
      }

      // Send the update request
      const response = await fetch('/api/admin/store/product', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }

      toast.success('Product updated successfully!');
      router.push(`/admin-dashboard/product-List/${product.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred while updating the product');
      console.error('Error updating product:', err);
    } finally {
      setIsSubmitting(false);
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
      <form onSubmit={handleSubmit} className="space-y-6">
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
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="categoryId"
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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          ></textarea>
        </div>

        <div>
          <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-1">
            Base Price *
          </label>
          <input
            type="number"
            id="basePrice"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Image
          </label>
          <input
            type="file"
            id="image"
            onChange={handleImageChange}
            accept="image/*"
            className="cursor-pointer w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave empty to keep the current image
          </p>
        </div>

        {/* Image preview */}
        {previewImage && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 mb-1">Image Preview</p>
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
            className="cursor-pointer bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </>
  );
}