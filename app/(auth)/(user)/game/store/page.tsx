'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSession } from 'next-auth/react'; // Import useSession
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Interfaces
interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  parentId: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price?: number;
  basePrice?: number;
  categoryId: string;
  imageUrl?: string;
}

export default function EcommercePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { data: session, status } = useSession(); // Get session data and status
  const router = useRouter();

  // Fetch categories on initial load if authenticated
  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load
    if (status === 'unauthenticated') {
      router.push('/login'); // Redirect to login if not authenticated
      return;
    }

    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/admin/store/productCategory', {
          headers: { Authorization: `Bearer ${session?.accessToken}` }, // Use session token
        });
        console.log('Categories Response:', response.data);
        const fetchedCategories = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];
        setCategories(fetchedCategories);

        const storedCategory = sessionStorage.getItem('selectedCategory');
        if (storedCategory) {
          setSelectedCategory(storedCategory);
          await fetchProducts(storedCategory);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') fetchCategories();
  }, [status, session]); // Depend on status and session

  // Fetch and filter products for a specific category
  const fetchProducts = async (categoryId: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/admin/store/product', {
        headers: { Authorization: `Bearer ${session?.accessToken}` }, // Use session token
      });
      console.log('Products Response:', response.data);
      const allProducts = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      
      const filteredProducts = allProducts.filter(
        (product: Product) => product.categoryId === categoryId
      );
      console.log('Filtered Products:', filteredProducts);
      
      const productsWithFallback = filteredProducts.map((product: Product) => ({
        ...product,
        price: product.price ?? 0,
        basePrice: product.basePrice ?? 0,
      }));
      setProducts(productsWithFallback);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle category selection
  const handleSelection = (categoryId: string) => {
    setSelectedCategory(categoryId);
    sessionStorage.setItem('selectedCategory', categoryId);
    fetchProducts(categoryId);
  };

  // Show loading state while session or data is loading
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  // Redirect if unauthenticated (handled in useEffect, but this is a fallback)
  if (status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <header className="bg-white shadow-md py-6 flex justify-between items-center px-6">
        <h1 className="text-3xl font-bold text-gray-800"> Shop Categories </h1>
        <Link href="/game/store/subscribe" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xl font-bold hover:bg-blue-800 transition-all duration-300">
         Subscribe Now
        </Link>
      </header>

      {/* Category Cards */}
      <div className="pt-12 pb-8 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((category: Category) => (
              <div
                key={category.id}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-center cursor-pointer rounded-lg p-6 relative"
                onClick={() => handleSelection(category.id)}
              >
                <p className="text-xl font-semibold">{category.name}</p>
                {selectedCategory === category.id && (
                  <div className="absolute top-2 right-2 bg-white text-gray-800 px-2 py-1 rounded-full text-sm font-medium">
                    Selected
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-700 text-xl font-medium">
              No categories available
            </p>
          )}
        </div>
      </div>

      {/* Product Cards */}
      {selectedCategory && (
        <div className="pb-16 max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Products in {categories.find(cat => cat.id === selectedCategory)?.name || 'Selected Category'}
          </h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product: Product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md p-4"
                >
                  <img
                    src={product.imageUrl || '/placeholder-product.jpg'}
                    alt={product.title}
                    className="w-full max-h-48 object-contain rounded-md mb-3"
                  />
                  <h3 className="text-lg font-semibold text-gray-800">{product.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                  <div className="mt-2">
                    <p className="text-black font-semibold text-lg  ">
                      Base: ${(product.basePrice ?? 0).toFixed(2)}
                    </p>
                    
                  </div>
                  <button
                    className="cursor-pointer mt-3 w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-2 rounded-md hover:from-indigo-700 hover:to-blue-700"
                    onClick={() => toast.success(`${product.title} added to cart`)}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-lg">
              No products available for this category
            </p>
          )}
        </div>
      )}
    </div>
  );
}