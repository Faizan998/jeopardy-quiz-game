"use client";

import React, { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Product, ProductCategory } from '@/app/type/types';
import UpdateProductForm from './UpdateProductForm';
import Link from 'next/link';

// Fetch product data client-side
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

export default function UpdateProductPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productData = await getProduct(id);
        const categoriesData = await getCategories();
        
        setProduct(productData);
        setCategories(categoriesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error || !product) {
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