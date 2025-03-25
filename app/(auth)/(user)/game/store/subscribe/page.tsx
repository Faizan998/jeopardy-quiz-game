"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

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
        alert("Subscription successful!");
        router.push("/store");
      } else {
        alert("Subscription failed!");
      }
    } catch (error) {
      console.error("Subscription error:", error);
    }
  };

  const plans = [
    { name: "One Month", value: "ONE_MONTH", discount: "10% Discount", benefits: "Enjoy a 10% discount on all store items." },
    { name: "One Year", value: "ONE_YEAR", discount: "22% Discount", benefits: "Get 22% discount and priority support." },
    { name: "Lifetime", value: "LIFETIME", discount: "34% Discount", benefits: "Unlock lifetime access with a 34% discount and premium features." },
  ];

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-white text-xl font-semibold">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-800 to-blue-600 text-white p-6">
      <div className="w-full max-w-6xl flex flex-wrap justify-center gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.value}
            className="relative bg-white p-8 w-80 h-96 shadow-lg text-center border border-blue-400 transition duration-200"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{
              scale: 1.1,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.95 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900">{plan.name}</h2>
            <p className="text-gray-700 font-semibold mb-2">{plan.discount}</p>
            <p className="text-gray-600 text-sm mb-6">{plan.benefits}</p>

            <motion.button
              onClick={() => handleSubscribe(plan.value)}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 font-bold text-lg hover:from-blue-600 hover:to-blue-800 transition shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
            >
              Subscribe
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
