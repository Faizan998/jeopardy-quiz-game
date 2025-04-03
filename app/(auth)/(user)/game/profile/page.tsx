'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { User,  Heart, ShoppingCart, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  discountedPrice?: number;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TabPanelProps {
  children: React.ReactNode;
  isActive: boolean;
}

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
}

const calculateDiscountedPrice = (basePrice: number, subscriptionType?: string, subscriptionEnd?: string | null): number => {
  if (!subscriptionType || !subscriptionEnd) return basePrice;
  
  // Check if subscription has expired
  const subscriptionEndDate = new Date(subscriptionEnd);
  if (subscriptionEndDate < new Date()) return basePrice;

  switch (subscriptionType) {
    case "ONE_MONTH":
      return Math.round(basePrice * 0.9 * 100) / 100; // 10% discount
    case "ONE_YEAR":
      return Math.round(basePrice * 0.78 * 100) / 100; // 22% discount
    case "LIFETIME":
      return Math.round(basePrice * 0.65 * 100) / 100; // 35% discount
    default:
      return basePrice;
  }
};

const TabPanel: React.FC<TabPanelProps> = ({ children, isActive }) => {
  if (!isActive) return null;
  return <div className="p-4">{children}</div>;
};



const WishlistSection = () => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [user, setUser] = useState<{ subscriptionType: string | undefined; subscriptionTypeEnd: string | null | undefined } | null>(null);

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get('/api/user/wishlist');
      const items = data.items.map((item: any) => ({
        ...item.product,
        basePrice: item.product.basePrice ?? 0,
        discountedPrice: calculateDiscountedPrice(
          item.product.basePrice ?? 0,
          user?.subscriptionType,
          user?.subscriptionTypeEnd
        )
      }));
      setWishlistItems(items);
    } catch (error) {
      toast.error('Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/user/profile");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    if (session?.user) {
      fetchUserData();
    }
  }, [session]);
  
  useEffect(() => {
    
      fetchWishlist();
    
  }, [fetchWishlist]);
  



  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await axios.delete('/api/user/wishlist', {
        data: { productId }
      });
      setWishlistItems(items => items.filter(item => item.id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <Heart className="cursor-pointer w-5 h-5" />
        My Wishlist
      </h3>
      {wishlistItems.length === 0 ? (
        <p className="text-gray-500">Your wishlist is empty</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => {
            const basePrice = product.basePrice ?? 0;
            const discountedPrice = calculateDiscountedPrice(
              basePrice,
              user?.subscriptionType,
              user?.subscriptionTypeEnd
            );
            const discount = user?.subscriptionType && user.subscriptionTypeEnd && new Date(user.subscriptionTypeEnd) > new Date()
              ? Math.round((1 - discountedPrice / basePrice) * 100)
              : 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md p-4 relative hover:shadow-lg transition-shadow cursor-pointer"
              >
                <button
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-black transition-colors z-10 cursor-pointer"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                </button>
                <div className="relative aspect-square mb-3">
                  <Image
                    src={product.imageUrl || "/placeholder-product.jpg"}
                    alt={product.title}
                    fill
                    className="object-contain rounded-md"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {product.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-2">
                  <p className="text-gray-500 line-through">${basePrice.toFixed(2)}</p>
                  {discount > 0 && (
                    <p className="text-green-600 font-bold">
                      ${discountedPrice.toFixed(2)} ({discount}% off with subscription)
                    </p>
                  )}
                  {!discount && (
                    <p className="text-black font-semibold text-lg">
                      ${basePrice.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CartSection = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) fetchCart();
  }, [session]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<CartResponse>('/api/user/cart');
      setCartItems(data.items || []);
    } catch (error) {
      toast.error('Error loading cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveFromCart(itemId);
      return;
    }

    try {
      const { data } = await axios.put<CartResponse>('/api/user/cart', { id: itemId, quantity });
      setCartItems(data.items);
      toast.success('Cart updated');
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const handleRemoveFromCart = async (itemId: string) => {
    try {
      const { data } = await axios.delete<CartResponse>('/api/user/cart', {
        data: { id: itemId }
      });
      setCartItems(data.items);
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Failed to remove from cart');
    }
  };

  // Calculate totals
  const baseTotal = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.discountedPrice * item.quantity),
    0
  );

  const discountTotal = baseTotal - totalPrice;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <ShoppingCart className="cursor-pointer w-5 h-5" />
        Shopping Cart
      </h3>
      {cartItems.length === 0 ? (
        <p className="text-gray-500">Your cart is empty</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => {
            const discount = Math.round((1 - item.discountedPrice / item.price) * 100);

            return (
              <div key={item.id} className="flex items-center gap-4 border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="relative w-24 h-24">
                  <Image
                    src={item.imageUrl || "/placeholder-product.jpg"}
                    alt={item.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{item.title}</h4>
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
                      Subtotal: ${(item.discountedPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 border rounded hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="min-w-[2rem] text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 border rounded hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="ml-4 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="mt-4 p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Order Summary</h4>
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
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={async () => {
                try {
                  await axios.post('/api/user/orders', {
                    items: cartItems.map(item => ({
                      productId: item.id,
                      quantity: item.quantity,
                      price: item.price,
                      discountedPrice: item.discountedPrice
                    })),
                    baseAmount: baseTotal,
                    discountAmount: discountTotal,
                    totalAmount: totalPrice
                  });
                  toast.success('Order placed successfully');
                  setCartItems([]);
                } catch (error) {
                  toast.error('Failed to place order');
                }
              }}
              className="w-full mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');

  if (!session?.user) {
    return <p className="text-center text-gray-500">No user data available</p>;
  }

  const user: UserProfile = {
    id: session.user.id,
    name: session.user.name || 'Unknown User',
    email: session.user.email || 'No Email',
    role: session.user.role,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex gap-4 border-b mb-4">
          <button
            className={`px-4 py-2 ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            <User className="w-5 h-5 inline-block mr-2" />
            Profile
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === 'wishlist'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('wishlist')}
          >
            <Heart className="w-5 h-5 inline-block mr-2" />
            Wishlist
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === 'cart'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('cart')}
          >
            <ShoppingCart className="w-5 h-5 inline-block mr-2" />
            Cart
          </button>
          <Link
            href="/game/store/orders"
            className="px-4 py-2 text-gray-500 hover:text-gray-700"
          >
            <Package className="w-5 h-5 inline-block mr-2" />
            Orders
          </Link>
        </div>

        <TabPanel isActive={activeTab === 'profile'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-lg">{session?.user?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-lg">{session?.user?.email || 'N/A'}</p>
            </div>
          </div>
        </TabPanel>

        <TabPanel isActive={activeTab === 'wishlist'}>
          <WishlistSection />
        </TabPanel>

        <TabPanel isActive={activeTab === 'cart'}>
          <CartSection />
        </TabPanel>
      </div>
    </div>
  );
}
