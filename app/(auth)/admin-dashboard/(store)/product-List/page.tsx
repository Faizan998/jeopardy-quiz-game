import React from 'react';
import Link from 'next/link';
import { Product } from '@/app/type/types'; // Assuming you have a Product type defined in your types file

export const dynamic = 'force-dynamic';

// Fetch all products from the API
async function getProducts(): Promise<{ products: Product[], error?: string }> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/admin/store/product`, {
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { 
        products: [],
        error: errorData.message || `Failed to fetch products: ${res.status}`
      };
    }

    return { products: await res.json() };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { 
      products: [], 
      error: error instanceof Error ? error.message : 'Failed to connect to the database'
    };
  }
}

export default async function ProductListPage() {
  const { products, error } = await getProducts();

  return (
    <div className="container mx-auto px-4 bg-gradient-to-r from-blue-900 to-blue-600 dark:bg-blue-500 text-white transition-all duration-300 ease-in-out py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link 
          href="/admin-dashboard/createProduct" // Adjust this path if necessary
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Product
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <p className="mt-2">
            Please check your database connection or try again later. If the problem persists, contact support.
          </p>
        </div>
      )}

      {products.length === 0 && !error ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No products found. Create a new one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:scale-105"
            >
              {/* Display the image if available */}
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-48 object-cover rounded-t-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-t-lg mb-4 flex justify-center items-center">
                  <span className="text-gray-500">No Image Available</span>
                </div>
              )}

              {/* Category Section */}
              <p className="text-md text-black-800 mb-2">
                <strong>Category:</strong> {product.category?.name || 'Uncategorized'}
              </p>

              {/* Title Section */}
              <h2 className="text-md font-semibold text-gray-700 mb-4">{product.title}</h2>

              {/* Price Section */}
              <p className="text-md text-gray-700 mb-4">
                <strong>Price:</strong> ${product.basePrice.toFixed(2)}
              </p>

              {/* Created At Section */}
              <p className="text-sm text-gray-500 mb-4">
                Created on {new Date(product.createdAt).toLocaleDateString()}
              </p>

              {/* Action Links */}
              <div className="flex justify-between">
                <Link 
                  href={`/admin-dashboard/product-List/${product.id}`} // Adjust path to view product
                  className="text-blue-600 hover:text-blue-900"
                >
                  View
                </Link>

                <Link 
                  href={`/admin-dashboard/product-List/${product.id}/update`} // Adjust path to edit product
                  className="text-green-600 hover:text-green-900"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
