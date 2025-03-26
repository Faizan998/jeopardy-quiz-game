import React from 'react';
import { notFound } from 'next/navigation';
import { Product, ProductCategory } from '@/app/type/types'; // Adjust import path as needed
import UpdateProductForm from './UpdateProductForm';
import Link from 'next/link';

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

// Fetch product categories for the form
async function getCategories(): Promise<ProductCategory[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/admin/store/productCategory`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.data || []; // Adjust based on your API response structure
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function UpdateProductPage({ params }: PageProps) {
  const product = await getProduct(params.id);
  const categories = await getCategories();

  if (!product) {
    return notFound();
  }

  return (
    <div className="flex justify-center items-center min-h-screen px-4 py-8 bg-gradient-to-r from-blue-900 to-blue-600 dark:bg-blue-500 transition-all duration-300 ease-in-out">
      {/* Container for the Card */}
      <div className="bg-white rounded-lg shadow-md p-6 w-full sm:w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Update Product</h1>
          <Link
            href={`/admin-dashboard/product-List/${product.id}`}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-all duration-200"
          >
            Cancel
          </Link>
        </div>

        <UpdateProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}