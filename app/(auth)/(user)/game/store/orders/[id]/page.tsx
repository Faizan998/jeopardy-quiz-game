"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

interface Order {
  id: string;
  userId: string;
  subscriptionType: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function OrderDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchOrder();
    }
  }, [status, router, params]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/user/orders/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        router.push("/game/store/orders");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      router.push("/game/store/orders");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
        <div className="text-white text-xl">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
        <div className="text-white text-xl">Order not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/game/store/orders"
            className="text-white hover:text-blue-300 transition-colors duration-300"
          >
            ← Back to Orders
          </Link>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            order.status === "completed"
              ? "bg-green-100 text-green-800"
              : order.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}>
            {order.status}
          </span>
        </div>

        <motion.div
          className="bg-white/90 backdrop-blur-md rounded-xl p-8 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Order Details</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-sm text-gray-600">Subscription Type</h2>
              <p className="text-xl font-semibold text-gray-900">
                {order.subscriptionType.replace("_", " ")}
              </p>
            </div>

            <div>
              <h2 className="text-sm text-gray-600">Amount</h2>
              <p className="text-2xl font-bold text-gray-900">₹{order.amount}</p>
            </div>

            <div>
              <h2 className="text-sm text-gray-600">Order Date</h2>
              <p className="text-lg text-gray-900">
                {new Date(order.createdAt).toLocaleDateString()} at{" "}
                {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>

            <div>
              <h2 className="text-sm text-gray-600">Order ID</h2>
              <p className="text-lg font-mono text-gray-900">{order.id}</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
            <p className="text-gray-600">
              If you have any questions about your order, please contact our support team.
            </p>
            <Link
              href="/support"
              className="inline-block mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition-colors duration-300"
            >
              Contact Support
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}