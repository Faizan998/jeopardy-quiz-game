// app/game/store/cart/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from "next-auth/react";
import { FiPlus, FiMinus, FiTrash } from "react-icons/fi";
import Link from "next/link";

interface CartItem {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) fetchCart();
  }, [session]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/user/cart");
      // Ensure price is a number and handle potential null/undefined values
      const items = (data.items || []).map((item: CartItem) => ({
        ...item,
        price:(item.price) || 0, // Convert to number, default to 0 if invalid
      }));
      console.log("Cart items:", items);
      setCartItems(items);
    } catch (error) {
      toast.error("Failed to load cart items");
      console.error("Fetch cart error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return removeItem(id);
    try {
      await axios.put("/api/user/cart", { id, quantity: newQuantity });
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
      toast.success("Quantity updated");
    } catch (error) {
      toast.error("Failed to update quantity");
      console.error("Update quantity error:", error);
    }
  };

  const removeItem = async (id: string) => {
    try {
      await axios.delete("/api/user/cart", { data: { id } });
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
      console.error("Remove item error:", error);
    }
  };

  // Calculate subtotal based on quantity
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );
  
  // Total is just the subtotal (no tax added)
  const total = subtotal;

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
      <h1 className="text-3xl font-bold text-center mb-6">🛒 Your Cart</h1>

      {cartItems.length > 0 ? (
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6">
            {cartItems.map((item) => (
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
                  <p className="text-gray-600">
                  Price: ${item.price.toFixed(2)}
                  </p>
                  <p className="text-gray-600">
                    Subtotal: ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="bg-gray-200 p-1 rounded-md hover:bg-gray-300"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <FiMinus />
                    </button>
                    <span className="text-lg font-semibold">{item.quantity}</span>
                    <button
                      className="bg-gray-200 p-1 rounded-md hover:bg-gray-300"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <FiPlus />
                    </button>
                    <button
                      className="ml-4 text-red-500 hover:text-red-700"
                      onClick={() => removeItem(item.id)}
                    >
                      <FiTrash size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
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