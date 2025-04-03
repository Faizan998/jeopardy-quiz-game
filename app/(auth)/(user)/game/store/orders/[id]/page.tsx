"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  quantity: number;
  discountedPrice: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  baseAmount: number;
  discountAmount: number;
  totalAmount: number;
  createdAt: string;
  status: string;
}

export default function OrderIdPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { id } = useParams();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user) fetchOrder();
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [session]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<Order>(`/api/user/orders/${id}`);
      setOrder(data);
    } catch (error) {
      toast.error("Failed to load order details");
      console.error("Fetch order error:", error);
      router.push("/game/store/orders");
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Order Not Found</h1>
        <div className="text-center">
          <Link
            href="/game/store/orders"
            className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-3xl font-bold text-center mb-6">📋 Order #{order.id.slice(0, 8)}</h1>

      <div className="max-w-4xl mx-auto">
        <div className="grid gap-6">
          {order.items.map((item) => {
            const discount = Math.round((1 - item.discountedPrice / item.price) * 100);

            return (
              <div
                key={item.id}
                className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-4"
              >
                <img
                  src={item.imageUrl || "/placeholder.png"}
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{item.title}</h2>
                  <div className="mt-2">
                    <p className="text-gray-600">
                      Base Price: ${item.price.toFixed(2)}
                    </p>
                    {discount > 0 && (
                      <p className="text-green-600">
                        Subscription Price: ${item.discountedPrice.toFixed(2)} ({discount}% off)
                      </p>
                    )}
                    <p className="text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-gray-600">
                      Subtotal: ${(item.discountedPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          <div className="flex justify-between mb-2">
            <span>Order ID:</span>
            <span>{order.id}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Date:</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Status:</span>
            <span className={order.status === "COMPLETED" ? "text-green-600" : "text-yellow-600"}>
              {order.status}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Base Total:</span>
            <span>${order.baseAmount.toFixed(2)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between mb-2 text-green-600">
              <span>Subscription Discount:</span>
              <span>-${order.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
          <Link
            href="/game/store/orders"
            className="cursor-pointer w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition text-center block"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
}