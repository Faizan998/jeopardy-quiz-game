"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SubscribePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSubscribe = async (plan: string) => {
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionType: plan }),
      });

      if (response.ok) {
        toast.success("Subscription successful! Redirecting to store...");
        setTimeout(() => {
          router.push("/game/store");
        }, 2000); // Delay the redirect to allow the toast to appear
      } else {
        toast.error("Subscription failed! Please try again.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  const plans = [
    { name: "One Month", value: "ONE_MONTH", discount: "10% Off", benefits: "Enjoy a 10% discount on all store items." },
    { name: "One Year", value: "ONE_YEAR", discount: "22% Off", benefits: "Get a 22% discount and priority support." },
    { name: "Lifetime", value: "LIFETIME", discount: "35% Off", benefits: "Unlock lifetime access with a 35% discount and premium features." },
  ];

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-white text-xl font-semibold">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white p-6">
      <div className="w-full max-w-6xl flex flex-wrap justify-center gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.value}
            className="relative bg-white/90 backdrop-blur-md p-8 w-80 h-96 shadow-lg text-center border-2 border-gray-400 rounded-xl transition duration-300 hover:shadow-xl"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{
              scale: 1.05,
              y: -5,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                {plan.discount}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 mt-4">{plan.name}</h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">{plan.benefits}</p>

            <motion.button
              onClick={() => handleSubscribe(plan.value)}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 font-bold text-lg rounded-full hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
            >
              Subscribe Now
            </motion.button>
          </motion.div>
        ))}
      </div>
      <ToastContainer />
    </div>
  );
}
