"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
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
  categoryId: string; // This holds the categoryId for BlogCategory
  newCategoryName?: string; // Optional, for creating a new category
}

export default function CreateBlog() {
  const router = useRouter();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    image: null,
    categoryId: "",
    newCategoryName: "", // New category input state
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch categories when the component mounts
  useEffect(() => {
    axios
      .get("/api/admin/Blogcategory")  // Fetch existing categories
      .then((response) => setCategories(response.data))
      .catch((error) => {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories.");
      });
  }, []);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle file change for image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData((prevData) => ({ ...prevData, image: file }));
  };

  // Handle blog creation form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("content", formData.content);
    formDataToSend.append("categoryId", formData.categoryId);

    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    // If a new category is provided, include that in the request as well
    if (formData.newCategoryName) {
      formDataToSend.append("newCategoryName", formData.newCategoryName);
    }

    try {
      await axios.post("/api/admin/blog", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Blog created successfully!");
      router.push("/auth/blog"); // Redirect to blog listing page
    } catch (error) {
      toast.error("Failed to create blog.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-center m-3 text-2xl">Create Blog Form</h1>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
          <input
            id="image"
            type="file"
            name="image"
            onChange={handleFileChange}
            accept="image/*"
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

       

        <div>
          <label htmlFor="newCategoryName" className="block text-sm font-medium text-gray-700 mb-1">New Category (Optional)</label>
          <input
            id="newCategoryName"
            type="text"
            name="newCategoryName"
            value={formData.newCategoryName}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Type a new category name (optional)"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 cursor-pointer"
          >
            {loading ? "Creating..." : "Create Blog"}
          </button>
        </div>
      </form>
    </div>
  );
}
