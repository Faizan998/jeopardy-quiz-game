"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";

interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  oneMonthPrice: number;
  oneYearPrice: number;
  lifetimePrice: number;
}

interface User {
  subscriptionType: "NONE" | "ONE_MONTH" | "ONE_YEAR" | "LIFETIME";
}

export default function StorePage() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      axios.get("/api/products").then((res) => setProducts(res.data));
      axios.get("/api/user").then((res) => setUser(res.data));
    }
  }, [status, router]);

  if (status === "loading") return <p>Loading...</p>;

  const getPrice = (product: Product) => {
    if (!user) return product.basePrice;
    switch (user.subscriptionType) {
      case "ONE_MONTH":
        return product.oneMonthPrice * 0.9;
      case "ONE_YEAR":
        return product.oneYearPrice * 0.78;
      case "LIFETIME":
        return product.lifetimePrice * 0.66;
      default:
        return product.basePrice;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Store</h1>
        <button
          onClick={() => router.push("/game/store/subscribe")}
          className="cursor-pointer mb-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Subscribe
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white p-6 border border-gray-300 shadow-lg">
              <img src={product.imageUrl} alt={product.title} className="w-full h-40 object-cover" />
              <h2 className="text-xl font-bold mt-2">{product.title}</h2>
              <p className="text-gray-600">{product.description}</p>
              <p className="text-lg font-semibold mt-2">${getPrice(product).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
