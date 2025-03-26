import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import DeleteProductButton from './DeleteProductButton';

// Define the Product interface based on your Prisma schema
interface Product {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  createdAt: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  };
}

// Define the page props type
type PageProps = {
  params: {
    id: string;
  };
};

// Fetch product data server-side
async function getProduct(id: string): Promise<Product | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/admin/store/product`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const products: Product[] = await res.json();
    const product = products.find((p) => p.id === id);
    return product || null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { id } = await params; // Await params to get the id
  const product = await getProduct(id);

  if (!product) {
    return notFound();
  }

  return (
    <div className="flex justify-center items-center min-h-screen px-4 py-8 bg-gradient-to-r from-blue-900 to-blue-600 dark:bg-blue-500 text-white transition-all duration-300 ease-in-out">
      {/* Container for the Card */}
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full sm:w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12 p-6">
        {/* Product Image */}
        {product.imageUrl && (
          <div className="mb-4">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-64 object-cover rounded-t-lg mb-4"
            />
          </div>
        )}

        {/* Category Section */}
        <div className="mb-4">
          <p className="text-lg text-gray-600">
            <strong>Category:</strong> {product.category?.name || 'Uncategorized'}
          </p>
        </div>

        {/* Title Section */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Title: {product.title}</h1>
        </div>

        {/* Product Description */}
        <div className="prose max-w-none mb-4 text-base text-gray-700">
          {product.description}
        </div>

        {/* Base Price */}
        <div className="mb-4">
          <p className="text-lg text-gray-700">
            <strong>Price:</strong> ${product.basePrice.toFixed(2)}
          </p>
        </div>

        {/* Created Date */}
        <div className="mb-4">
          <p className="text-md text-gray-500">
            <strong>Created:</strong> {new Date(product.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-4">
          <Link
            href={`/admin-dashboard/product-List`}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back
          </Link>
          <Link
            href={`/admin-dashboard/product-List/${product.id}/update`}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Edit
          </Link>
          <DeleteProductButton productId={id} />
        </div>
      </div>
    </div>
  );
}