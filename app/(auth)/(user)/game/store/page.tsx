// app/game/store/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useCallback } from "react";
import Image from "next/image";

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
  isInWishlist?: boolean;
  discountedPrice?: number;
}

interface User {
  subscriptionType: string;
  subscriptionTypeEnd: string | null;
}

export default function EcommercePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);

  const { data: session, status } = useSession();
  const router = useRouter();

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/admin/store/productCategory", {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      const fetchedCategories = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setCategories(fetchedCategories);
  
      const storedCategory = sessionStorage.getItem("selectedCategory");
      if (storedCategory) {
        setSelectedCategory(storedCategory);
        await fetchProducts(storedCategory);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken]); // dependency add ki gayi hai
  
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/user/profile", {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    if (status === "authenticated") {
      fetchUserData();
      fetchCategories();
      fetchWishlist();
    }
  }, [status, session, router, fetchCategories]); // fetchCategories ko dependency me add kiya

 

  const fetchProducts = useCallback(async (categoryId: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/admin/store/product", {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      
      const allProducts = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
  
      const filteredProducts = allProducts.filter(
        (product: Product) => product.categoryId === categoryId
      );
  
      const productsWithFallback = filteredProducts.map((product: Product) => ({
        ...product,
        price: product.price ?? 0,
        basePrice: product.basePrice ?? 0,
      }));
      setProducts(productsWithFallback);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken]); // session?.accessToken ko dependency array me add kiya
  
  useEffect(() => {
    fetchCategories();
  }, [fetchProducts]);
  

  const fetchWishlist = async () => {
    try {
      const response = await axios.get("/api/user/wishlist");
      if (response.data) {
        const wishlistProductIds: string[] = response.data.items.map(
          (item: { product: { id: string } }) => item.product.id
        );
        setWishlistItems(wishlistProductIds);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const handleSelection = (categoryId: string) => {
    setSelectedCategory(categoryId);
    sessionStorage.setItem("selectedCategory", categoryId);
    fetchProducts(categoryId);
  };

  const handleAddToCart = async (product: Product) => {
    console.log("Adding to cart:", product);
    try {
      const response = await axios.post("/api/user/cart", {
        id: product.id,
        title: product.title,
        price: product.basePrice ?? 0,
        imageUrl: product.imageUrl || "/placeholder-product.jpg",
        quantity: 1,
      });
      console.log("Add to cart response:", response);
      toast.success("Product added to cart!");
      router.push("/game/store/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add product to cart.");
    }
  };

  const calculateDiscountedPrice = (basePrice: number): number => {
    if (!user?.subscriptionType || !user.subscriptionTypeEnd) return basePrice;

    // Check if subscription has expired
    const subscriptionEnd = new Date(user.subscriptionTypeEnd);
    if (subscriptionEnd < new Date()) return basePrice;

    switch (user.subscriptionType) {
      case "ONE_MONTH":
        return basePrice * 0.9; // 10% discount
      case "ONE_YEAR":
        return basePrice * 0.78; // 22% discount
      case "LIFETIME":
        return basePrice * 0.65; // 35% discount
      default:
        return basePrice;
    }
  };

  const handleWishlistToggle = async (productId: string) => {
    try {
      const isInWishlist = wishlistItems.includes(productId);
      const method = isInWishlist ? "DELETE" : "POST";
      const product = products.find((p) => p.id === productId);

      if (!product) {
        toast.error("Product not found");
        return;
      }

      const basePrice = product.basePrice ?? 0;
      const discountedPrice = calculateDiscountedPrice(basePrice);

      await axios({
        method,
        url: "/api/user/wishlist",
        data: {
          productId,
          basePrice,
          discountedPrice,
        },
      });

      setWishlistItems((prev) =>
        isInWishlist
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );

      toast.success(
        isInWishlist ? "Removed from wishlist" : "Added to wishlist"
      );
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />

      <header className="bg-white shadow-md py-6 flex justify-between items-center px-6">
        <h1 className="text-3xl font-bold text-gray-800">Shop Categories</h1>
        <div className="flex items-center gap-4">
          {user?.subscriptionType && user.subscriptionTypeEnd && (
            <div className="text-sm text-gray-600">
              <p>Subscription: {user.subscriptionType.replace(/_/g, " ")}</p>
              <p>
                Expires:{" "}
                {new Date(user.subscriptionTypeEnd).toLocaleDateString()}
              </p>
            </div>
          )}
          <Link
            href="/game/store/subscribe"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xl font-bold hover:bg-blue-800 transition-all duration-300"
          >
            Subscribe Now
          </Link>
        </div>
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

      {selectedCategory && (
        <div className="pb-16 max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Products in{" "}
            {categories.find((cat) => cat.id === selectedCategory)?.name ||
              "Selected Category"}
          </h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product: Product) => {
                const basePrice = product.basePrice ?? 0;
                const discountedPrice = calculateDiscountedPrice(basePrice);
                const discount =
                  user?.subscriptionType &&
                  user.subscriptionTypeEnd &&
                  new Date(user.subscriptionTypeEnd) > new Date()
                    ? Math.round((1 - discountedPrice / basePrice) * 100)
                    : 0;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md p-4 relative"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWishlistToggle(product.id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-black transition-colors z-10"
                    >
                      <Heart
                        className={`cursor-pointer w-5 h-5 ${
                          wishlistItems.includes(product.id)
                            ? "text-red-500 fill-current"
                            : "text-red-500"
                        }`}
                      />
                    </button>
                    <Image
                      src={product.imageUrl || "/placeholder-product.jpg"}
                      alt={product.title}
                      width={300}
                      height={200}
                      className="w-full max-h-48 object-contain rounded-md mb-3"
                    />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {product.description}
                    </p>
                    <div className="mt-2">
                      <p className="text-gray-500 line-through">
                        ${basePrice.toFixed(2)}
                      </p>
                      {discount > 0 && (
                        <p className="text-green-600 font-bold">
                          ${discountedPrice.toFixed(2)} ({discount}% off with
                          subscription)
                        </p>
                      )}
                      {!discount && (
                        <p className="text-black font-semibold text-lg">
                          ${basePrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="cursor-pointer mt-3 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-md hover:scale-105 hover:brightness-110 transition-transform duration-300"
                    >
                      Add to Cart
                    </button>
                  </div>
                );
              })}
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
