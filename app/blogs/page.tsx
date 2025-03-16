import BlogGrid from '@/app/components/BlogGrid';
import { getBlogs } from '@/app/actions/blogActions';

export default async function BlogsPage() {
  const blogs = await getBlogs();

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Blog Posts</h1>
        <BlogGrid blogs={blogs} />
      </div>
    </div>
  );
} 