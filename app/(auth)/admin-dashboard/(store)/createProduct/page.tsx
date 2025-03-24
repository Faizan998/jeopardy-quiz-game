'use client';

import { useState, FormEvent } from 'react';

interface FormData {
  category: string;
  title: string;
  description: string;
  image: File | null;
  basePrice: string; // Changed to string to allow empty initial value
  oneMonthPrice: string; // Changed to string
  oneYearPrice: string; // Changed to string
  lifetimePrice: string; // Changed to string
}

export default function SubscriptionForm() {
  const [formData, setFormData] = useState<FormData>({
    category: '',
    title: '',
    description: '',
    image: null,
    basePrice: '', // No initial 0
    oneMonthPrice: '', // No initial 0
    oneYearPrice: '', // No initial 0
    lifetimePrice: '', // No initial 0
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value, // Keep as string, no parsing here
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Convert price fields to numbers for submission if needed
    const submissionData = {
      ...formData,
      basePrice: parseFloat(formData.basePrice) || 0,
      oneMonthPrice: parseFloat(formData.oneMonthPrice) || 0,
      oneYearPrice: parseFloat(formData.oneYearPrice) || 0,
      lifetimePrice: parseFloat(formData.lifetimePrice) || 0,
    };
    console.log('Form Submitted:', submissionData);
    // Add your submission logic here (e.g., API call)
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 to-blue-600 text-white p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-black"
      >
        <h2 className="text-2xl font-bold mb-6 text-center"> create Products</h2>

      {/* Category */}
<div className="mb-4">
  <label htmlFor="category" className="block text-sm font-medium mb-1">
    Category
  </label>
  <select
    id="category"
    name="category"
    value={formData.category}
    
    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    required
  >
   
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
        <div className="mb-4">
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

        {/* One Month Subscription Price */}
        <div className="mb-4">
          <label htmlFor="oneMonthPrice" className="block text-sm font-medium mb-1">
            One Month Subscription Price
          </label>
          <input
            type="number"
            id="oneMonthPrice"
            name="oneMonthPrice"
            value={formData.oneMonthPrice}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
            required
          />
        </div>

        {/* One Year Subscription Price */}
        <div className="mb-4">
          <label htmlFor="oneYearPrice" className="block text-sm font-medium mb-1">
            One Year Subscription Price
          </label>
          <input
            type="number"
            id="oneYearPrice"
            name="oneYearPrice"
            value={formData.oneYearPrice}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
            required
          />
        </div>

        {/* Lifetime Subscription Price */}
        <div className="mb-6">
          <label htmlFor="lifetimePrice" className="block text-sm font-medium mb-1">
            Lifetime Subscription Price
          </label>
          <input
            type="number"
            id="lifetimePrice"
            name="lifetimePrice"
            value={formData.lifetimePrice}
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
        >
          Submit
        </button>
      </form>
    </div>
  );
}