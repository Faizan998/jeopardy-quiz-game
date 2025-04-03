"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface OrderItem {
  id: string;
  createdAt: string;
  status: string;
  paymentReference: string | null;
  items: {
    productId: string;
    title: string;
    imageUrl: string;
    price: number;
    discountedPrice: number;
    quantity: number;
  }[];
  baseAmount: number;
  discountAmount: number;
  totalAmount: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user) fetchOrders();
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [session, router, status]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<OrderItem[]>("/api/user/orders");
      setOrders(data);
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
              <div key={order.id} className="bg-white p-4 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold">Order ID: {order.id}</h2>
                <p className="text-gray-600">
                  Placed on: {new Date(order.createdAt).toLocaleString()}
                </p>
                <p className="text-gray-600 font-medium">
                  Status: {order.status}
                </p>
                {order.paymentReference && (
                  <p className="text-gray-600">
                    Payment Ref: {order.paymentReference}
                  </p>
                )}

                <div className="mt-4">
                  {order.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-4 border-b py-2"
                    >
                      <Image
                        src={item.imageUrl || "/placeholder.png"}
                        alt={item.title}
                        width={80} // ✅ Required width
                        height={80} // ✅ Required height
                        className="w-20 h-20 object-cover rounded-md"
                      />

                      <div>
                        <h3 className="text-lg">{item.title}</h3>
                        <p className="text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-gray-600">
                          Price: ${item.discountedPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <p className="font-semibold">
                    Total Amount: ${order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">You have no orders yet</p>
          <Link
            href="/game/store"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
