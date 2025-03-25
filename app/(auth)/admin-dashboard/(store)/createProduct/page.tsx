'use client';

import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';

interface FormData {
  categoryId: string;
  title: string;
  description: string;
  image: File | null;
  basePrice: string;
}

interface Category {
  id: string;
  name: string;
}

export default function SubscriptionForm() {
  const [formData, setFormData] = useState<FormData>({
    categoryId: '',
    title: '',
    description: '',
    image: null,
    basePrice: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get('/api/admin/store/productCategory')
      .then((res) => {
        console.log('Category API response:', res.data.data);
        if (Array.isArray(res.data.data)) {
          setCategories(res.data.data);
        } else {
          console.error('Invalid category data format:', res.data.data);
          setCategories([]); // Ensure categories is always an array
        }
      })
      .catch((err) => {
        console.error('Error fetching categories:', err);
        setCategories([]); // Fallback to empty array on error
      });
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const submissionData = new FormData();
    submissionData.append('categoryId', formData.categoryId);
    submissionData.append('title', formData.title);
    submissionData.append('description', formData.description);
    submissionData.append('basePrice', formData.basePrice);
    if (formData.image) {
      submissionData.append('image', formData.image);
    }

    try {
      const response = await axios.post('/api/admin/store/product', submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Product submitted successfully:', response.data);
      alert('Product added successfully!');
      setFormData({
        categoryId: '',
        title: '',
        description: '',
        image: null,
        basePrice: '',
      });
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 to-blue-600 text-white p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-black"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Create Product</h2>

        {/* Category Selection */}
        <div className="mb-4">
          <label htmlFor="categoryId" className="block text-sm font-medium mb-1">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Category</option>
            {categories.length > 0 ? (
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            ) : (
              <option disabled>Loading categories...</option>
            )}
          </select>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            required
          />
        </div>

        {/* Image */}
        <div className="mb-4">
          <label htmlFor="image" className="block text-sm font-medium mb-1">
            Image
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Base Price */}
        <div className="mb-6">
          <label htmlFor="basePrice" className="block text-sm font-medium mb-1">
            Base Price
          </label>
          <input
            type="number"
            id="basePrice"
            name="basePrice"
            value={formData.basePrice}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
