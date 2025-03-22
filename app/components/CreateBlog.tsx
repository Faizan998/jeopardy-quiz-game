"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define types for BlogCategory and FormData
interface BlogCategory {
  id: string;
  name: string;
}

interface FormData {
  title: string;
  content: string;
  image: File | null;
  categoryId: string;
}

// Define API response types
interface BlogResponse {
  message: string;
  blog?: {
    id: string;
    title: string;
    content: string;
    imageUrl: string;
    categoryId: string;
    createdAt: string;
    updatedAt: string;
    category?: BlogCategory;
  };
}

export default function CreateBlog() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    image: null,
    categoryId: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories dynamically from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/admin/blogCategory");
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else if (response.data && Array.isArray(response.data.categories)) {
          setCategories(response.data.categories);
        } else {
          console.error("Unexpected response format:", response.data);
          toast.error("Failed to load categories. Unexpected data format.");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories.");
      }
    };
    fetchCategories();
  }, []);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle file change for image upload with preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    
    if (file) {
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPEG, PNG, and WebP images are allowed");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      // Create preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      setFormData((prevData) => ({ ...prevData, image: file }));
    } else {
      setImagePreview(null);
      setFormData((prevData) => ({ ...prevData, image: null }));
    }
  };

  // Handle blog creation form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.title.trim()) {
      toast.error("Please enter a blog title");
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error("Please enter blog content");
      return;
    }
    
    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    }
    
    if (!formData.image) {
      toast.error("Please upload an image");
      return;
    }
    
    setLoading(true);
  
    try {
      // Create a new FormData instance for the multipart/form-data request
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("categoryId", formData.categoryId);
    
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }
    
      // Log the form data keys (not values - they can't be directly logged)
      console.log("Form data entries:", [...formDataToSend.entries()].map(entry => entry[0]));
      
      const response = await axios.post<BlogResponse>(
        "/api/admin/blog", 
        formDataToSend, 
        {
          headers: { 
            "Content-Type": "multipart/form-data" 
          },
          // Add timeout to prevent long-hanging requests
          timeout: 30000
        }
      );
      
      toast.success(response.data.message || "Blog created successfully!");
      
      // Reset form data
      setFormData({
        title: "",
        content: "",
        image: null,
        categoryId: "",
      });
      
      // Clear image preview
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Error creating blog:", error);
      
      // Get detailed error message
      let errorMessage = "Failed to create blog.";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your network connection.";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || "An unknown error occurred";
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clean up any object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl space-y-6">
        <h1 className="text-2xl font-semibold text-center text-blue-600">Create a Blog</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Blog Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
              placeholder="Enter blog title"
              required
            />
          </div>

          {/* Content Textarea */}
          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Blog Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
              placeholder="Write your blog content here"
              rows={5}
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Upload Image
            </label>
            <input
              id="image"
              type="file"
              name="image"
              onChange={handleFileChange}
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
              required
            />
            {imagePreview && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-40 rounded-md shadow-sm" 
                />
              </div>
            )}
            <p className="text-xs text-gray-500">
              Allowed formats: JPEG, PNG, WebP. Maximum size: 5MB
            </p>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2">
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
              Select Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
              required
            >
              <option value="">Select a category</option>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>Loading categories...</option>
              )}
            </select>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out disabled:bg-blue-400"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Blog"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
