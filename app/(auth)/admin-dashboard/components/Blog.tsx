"use client"
import Navbar from '@/app/components/admin/Navbar';
import BlogForm from '@/app/components/admin/BlogForm';

export default function AdminBlogPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto py-8">
        <BlogForm />
      </main>
    </div>
  );
} 