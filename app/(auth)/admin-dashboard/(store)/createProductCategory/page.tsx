"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define TypeScript type for form data
interface CategoryFormData {
  categoryName: string;
}

export default function CategoryForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CategoryFormData>();

  // Handle form submission
  const onSubmit: SubmitHandler<CategoryFormData> = async (data) => {
    try {
      const response = await axios.post("/api/admin/blogCategory", {
        name: data.categoryName,
      });

      setSuccessMessage("Category created successfully!");
      setErrorMessage(null);
      toast.success("Category created successfully!");
      console.log("Category created:", response.data);

      reset(); // Reset form after success
    } catch (error) {
      setErrorMessage("Error creating category. Please try again.");
      setSuccessMessage(null);
      toast.error("Error creating category. Please try again.");
      console.error("Error creating category:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-r from-blue-900 to-blue-600 dark:bg-blue-500 text-white transition-all duration-300 ease-in-out">
       <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg space-y-6 mb-8">
        <h2 className="text-2xl text-blue-700 font-semibold text-center">
          Create New ProductCategory
        </h2>

        {/* Success Message */}
        {successMessage && (
          <div className="text-green-300 text-sm text-center">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="text-red-300 text-sm text-center">{errorMessage}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category Name Input */}
          <div className="  text-black flex flex-col">
            <label
              htmlFor="categoryName"
              className="text-sm font-medium text-black"
            >
              Product Category Name
            </label>
            <input
              id="categoryName"
              type="text"
              placeholder="Enter category name"
              className="mt-2 p-3 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
              {...register("categoryName", {
                required: "Category name is required",
                minLength: {
                  value: 3,
                  message: "Category name must be at least 3 characters",
                },
                maxLength: {
                  value: 50,
                  message: "Category name must be no longer than 50 characters",
                },
              })}
            />
            {errors.categoryName && (
              <span className="text-sm text-red-300 mt-1">
                {errors.categoryName.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
             className="w-full cursor-pointer bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Create Category"}
          </button>
        </form>

        {/* Additional Information */}
        <div className="text-center text-sm  text-black">
          <p>
            Create and manage your categories easily. Make sure to keep them
            short and meaningful.
          </p>
        </div>
      </div>

      {/* ToastContainer */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}