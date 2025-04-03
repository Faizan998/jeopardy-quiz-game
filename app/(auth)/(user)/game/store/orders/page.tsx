"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
  id: string;
  totalAmount: number;
  baseAmount: number;
  discountAmount: number;
  createdAt: string;
  status: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user) fetchOrders();
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<Order[]>("/api/user/orders/list"); // New API endpoint
      setOrders(data || []);
    } catch (error) {
      toast.error("Failed to load orders");
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-3xl font-bold text-center mb-6">📦 Your Orders</h1>

      {orders.length > 0 ? (
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6">
            {orders.map((order) => (
              <Link href={`/game/store/orders/${order.id}`} key={order.id}>
                <div className="bg-white p-4 rounded-lg shadow-lg flex justify-between items-center gap-4 cursor-pointer hover:bg-gray-50 transition">
                  <div>
                    <h2 className="text-xl font-semibold">Order #{order.id.slice(0, 8)}</h2>
                    <p className="text-gray-600">
                      Date: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className={order.status === "COMPLETED" ? "text-green-600" : "text-yellow-600"}>
                      Status: {order.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Base Total: ${order.baseAmount.toFixed(2)}</p>
                    {order.discountAmount > 0 && (
                      <p className="text-green-600">
                        Discount: -${order.discountAmount.toFixed(2)}
                      </p>
                    )}
                    <p className="font-bold">Total: ${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/game/store"
              className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">You have no orders yet</p>
          <Link
            href="/game/store"
            className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}