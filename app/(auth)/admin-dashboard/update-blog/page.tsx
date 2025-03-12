"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface Blog {
  id: string;
  title: string;
  content: string;
  image?: string;
  published: boolean;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  created_at: string;
  updated_at: string;
}

export default function UpdateBlog() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state for new/edit blog
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
    published: false
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/blogs");
      setBlogs(response.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setError("Failed to load blogs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      image: "",
      published: false
    });
    setSelectedBlog(null);
    setFormMode("add");
  };

  const handleEditBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      image: blog.image || "",
      published: blog.published
    });
    setFormMode("edit");
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) {
      return;
    }

    try {
      await axios.delete(`/api/blogs?id=${id}`);
      setSuccess("Blog deleted successfully!");
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      setError("Failed to delete blog. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      setError("Blog title is required");
      return;
    }
    
    if (!formData.content.trim()) {
      setError("Blog content is required");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      if (formMode === "add") {
        await axios.post("/api/blogs", formData);
        setSuccess("Blog added successfully!");
      } else {
        await axios.put("/api/blogs", {
          id: selectedBlog?.id,
          ...formData
        });
        setSuccess("Blog updated successfully!");
      }
      
      resetForm();
      fetchBlogs();
    } catch (error) {
      console.error("Error saving blog:", error);
      setError("Failed to save blog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Manage Blogs</h1>
      
      {error && (
        <div className="bg-red-900 text-white p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-900 text-white p-4 rounded-lg mb-6">
          {success}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Blog Form */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">
            {formMode === "add" ? "Add New Blog" : "Edit Blog"}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
                rows={8}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Image URL (optional)</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="mb-6 flex items-center">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleInputChange}
                className="mr-2 h-5 w-5"
                id="published"
              />
              <label htmlFor="published" className="text-gray-300">
                Publish this blog
              </label>
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? "Saving..." : formMode === "add" ? "Add Blog" : "Update Blog"}
              </button>
              
              {formMode === "edit" && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Blogs List */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Existing Blogs</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : blogs.length === 0 ? (
            <p className="text-gray-400">No blogs found.</p>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {blogs.map(blog => (
                <div key={blog.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{blog.title}</h3>
                      <div className="flex items-center text-sm text-gray-400 mt-1">
                        <span>By {blog.author.name}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(blog.created_at)}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs ${blog.published ? 'bg-green-800' : 'bg-gray-600'}`}>
                          {blog.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditBlog(blog)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-3 mt-2">
                    {blog.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
