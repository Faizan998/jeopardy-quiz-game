"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Blog {
  title: string;
  content: string;
  imageUrl: string;
  category: { _id: string; name: string };
}

interface Category {
  _id: string;
  name: string;
}

export default function BlogList() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`/api/admin/blog`);
        setBlogs(response.data);
      } catch (error) {
        console.error("Failed to fetch blogs.");
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/admin/category");
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories.");
      }
    };

    fetchBlogs();
    fetchCategories();
  }, []);

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
  };

  const filteredBlogs = selectedCategory
    ? blogs.filter((blog) => blog.category._id === selectedCategory)
    : blogs;

  return (
    <div>
      <div className="my-4">
        <select
          onChange={handleCategoryChange}
          value={selectedCategory}
          className="p-3 border rounded-lg"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.map((blog) => (
          <div key={blog.title} className="border p-4 rounded-lg">
            <h2 className="font-semibold text-lg">{blog.title}</h2>
            <p>{blog.content.substring(0, 100)}...</p>
            <p className="mt-2 text-sm">Category: {blog.category.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
