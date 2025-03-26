"use client";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css"; // Import CSS for the toast notifications

// Define TypeScript type for form data
interface CategoryFormData {
  categoryName: string;
}

function CategoryForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // For error handling
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // For success message
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset, // Get the reset method from react-hook-form
  } = useForm<CategoryFormData>();

  // Handle form submission
  const onSubmit: SubmitHandler<CategoryFormData> = async (data) => {
    try {
      // Call your Supabase API to create the category
      const response = await axios.post("/api/admin/blogCategory", {
        name: data.categoryName, // Send category name in the body
      });

      // If the API call is successful
      toast.success("Category created successfully!"); // Show success toast
      console.log("Category created:", response.data);

      // Reset the form after success
      reset(); // Clears all the input fields after a successful submission

    } catch (error) {
      // Handle errors
      toast.error("Error creating category. Please try again."); // Show error toast
      console.error("Error creating category:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-r from-blue-900 to-blue-600 dark:bg-blue-500 text-black transition-all duration-300 ease-in-out">
      <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg space-y-6 mb-8">
        <h2 className="text-2xl font-semibold text-center text-blue-700">
          Create New Category
        </h2>

        {/* Display success message */}
        {successMessage && (
          <div className="text-green-600 text-sm text-center">{successMessage}</div>
        )}

        {/* Display error message */}
        {errorMessage && (
          <div className="text-red-600 text-sm text-center">{errorMessage}</div>
        )}

        {/* Form with validation */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category Name Input */}
          <div className="flex flex-col">
            <label
              htmlFor="categoryName"
              className="text-sm font-medium text-black"
            >
              Category Name
            </label>
            <input
              id="categoryName"
              type="text"
              placeholder="Enter category name"
               className="mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
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
            {/* Error message */}
            {errors.categoryName && (
              <span className="text-sm text-red-500 mt-1">
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
        <div className="text-center text-sm text-black">
          <p>
            Create and manage your categories easily. Make sure to keep them
            short and meaningful.
          </p>
        </div>
      </div>

      {/* ToastContainer to display the toasts */}
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
    </div>
  );
}

export default CategoryForm;
