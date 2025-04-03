"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from "next-auth/react";
import { FiPlus, FiMinus, FiTrash } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CartItem {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  quantity: number;
  discountedPrice: number;
}

interface CartResponse {
  items: CartItem[];
  totalPrice: number;
  baseTotal: number;
  discountTotal: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user) fetchCart();
    if (status === "unauthenticated") {
      router.push("/login"); // Login page par redirect
    }
  }, [session, router, status]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<CartResponse>("/api/user/cart");
      console.log("Cart data:", data);
      setCartItems(data.items);
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
      const { data } = await axios.put<CartResponse>("/api/user/cart", {
        id,
        quantity: newQuantity,
      });
      setCartItems(data.items);
      toast.success("Quantity updated");
    } catch (error) {
      toast.error("Failed to update quantity");
      console.error("Update quantity error:", error);
    }
  };

  const removeItem = async (id: string) => {
    try {
      const { data } = await axios.delete<CartResponse>("/api/user/cart", {
        data: { id },
      });
      setCartItems(data.items);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
      console.error("Remove item error:", error);
    }
  };

  const placeOrder = async () => {
    try {
      const { data } = await axios.post("/api/user/orders", {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          discountedPrice: item.discountedPrice,
        })),
        baseAmount: cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
        discountAmount: cartItems.reduce(
          (sum, item) =>
            sum + (item.price - item.discountedPrice) * item.quantity,
          0
        ),
        totalAmount: cartItems.reduce(
          (sum, item) => sum + item.discountedPrice * item.quantity,
          0
        ),
      });
      console.log("Order Response:", data);
      toast.success("Order created successfully");
      router.push(`/game/store/orders`); // Redirect to general orders page
    } catch (error) {
      toast.error("Failed to create order");
      console.error("Place order error:", error);
    }
  };

  // Calculate totals
  const baseTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.discountedPrice * item.quantity,
    0
  );

  const discountTotal = baseTotal - totalPrice;

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
            {cartItems.map((item) => {
              const discount = Math.round(
                (1 - item.discountedPrice / item.price) * 100
              );

              return (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-4"
                >
                  <Image
                    src={item.imageUrl || "/placeholder.png"}
                    alt={item.title}
                    width={96} // 24 * 4 = 96px
                    height={96} // 24 * 4 = 96px
                    className="object-cover rounded-md"
                  />

                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{item.title}</h2>
                    <div className="mt-2">
                      <p className="text-gray-600">
                        Base Price: ${item.price.toFixed(2)}
                      </p>
                      {discount > 0 && (
                        <p className="text-green-600">
                          Subscription Price: ${item.discountedPrice.toFixed(2)}{" "}
                          ({discount}% off)
                        </p>
                      )}
                      <p className="text-gray-600">
                        Subtotal: $
                        {(item.discountedPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="cursor-pointer bg-gray-200 p-1 rounded-md hover:bg-gray-300"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <FiMinus />
                      </button>
                      <span className="text-lg font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        className="cursor-pointer bg-gray-200 p-1 rounded-md hover:bg-gray-300"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <FiPlus />
                      </button>
                      <button
                        className="cursor-pointer ml-4 text-red-500 hover:text-red-700"
                        onClick={() => removeItem(item.id)}
                      >
                        <FiTrash size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Base Total:</span>
              <span>${baseTotal.toFixed(2)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between mb-2 text-green-600">
                <span>Subscription Discount:</span>
                <span>-${discountTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="cursor-pointer flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={placeOrder}
              className="cursor-pointer w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
            >
              Place Order
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
          <Link
            href="/game/store"
            className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
