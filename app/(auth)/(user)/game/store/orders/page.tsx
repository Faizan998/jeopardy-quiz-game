"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface OrderItem {
  productId: string;
  title: string;
  imageUrl: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  product?: {
    imageUrl: string;
  };
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
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
      const { data } = await axios.get<Order[]>("/api/user/orders");
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
              <div key={order.id} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                  <div className="text-right">
                    <p className="text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className={`font-semibold ${
                      order.status === 'completed' ? 'text-green-600' : 
                      order.status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {order.items.map((item) => {
                    const discount = Math.round((1 - item.discountedPrice / item.price) * 100);

                    return (
                      <div
                        key={item.productId}
                        className="flex flex-col bg-gray-50 rounded-lg overflow-hidden"
                      >
                        <div className="relative h-48 w-full">
                          <img
                            src={item.product?.imageUrl || item.imageUrl || "/placeholder.png"}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          {discount > 0 && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                              {discount}% OFF
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Base Price:</span>
                              <span className="font-medium">${item.price.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Discounted Price:</span>
                                <span className="font-medium">${item.discountedPrice.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Quantity:</span>
                              <span className="font-medium">{item.quantity}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                              <span className="font-semibold">Subtotal:</span>
                              <span className="font-semibold">${(item.discountedPrice * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span>Base Total:</span>
                    <span>${order.baseAmount.toFixed(2)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between mb-2 text-green-600">
                      <span>Total Discount:</span>
                      <span>-${order.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Final Total:</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-600">
          <p className="text-xl mb-4">You haven't placed any orders yet.</p>
        </div>
      )}
    </div>
  );
}