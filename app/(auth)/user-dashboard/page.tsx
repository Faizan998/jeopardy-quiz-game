"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import JeopardyBoard from "@/app/components/JeopardyBoard";
import UserScore from "@/app/components/UserScore";

export default function UserDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to refresh user data
  const refreshUserData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        console.log("Token found:", token.substring(0, 20) + "..."); // Log partial token for debugging

        // Fetch user data
        const userResponse = await axios.get("/api/user/profile", {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
        
        console.log("User data received:", userResponse.data);
        setUserData(userResponse.data);

        // Fetch categories and questions for the Jeopardy board
        const categoriesResponse = await axios.get("/api/user/categories", {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
        
        console.log("Categories received:", categoriesResponse.data.length);
        setCategories(categoriesResponse.data);
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        
        // If token is invalid, redirect to login
        if (error.response?.status === 401) {
          localStorage.removeItem("token"); // Clear invalid token
          setError("Your session has expired. Please log in again.");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else {
          setError(error.response?.data?.message || "Failed to load dashboard data");
        }
        
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, refreshTrigger]); // Add refreshTrigger to dependencies

  // Function to handle answer submission
  const handleAnswerSubmitted = useCallback(() => {
    // Refresh user data to update score
    refreshUserData();
  }, [refreshUserData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-950">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 0, 270, 270, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "loop"
          }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="ml-4 text-white text-2xl font-bold"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-950">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-600 text-white p-6 rounded-lg shadow-2xl max-w-md w-full mx-4"
        >
          <motion.div
            animate={{ x: [0, -5, 5, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
            className="text-3xl mb-2"
          >
            ⚠️
          </motion.div>
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-xl mb-6">{error}</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/login")}
            className="w-full bg-white text-red-600 px-4 py-3 rounded-md font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            Back to Login
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
        >
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            <span className="text-yellow-400">Jeopardy</span> Game Dashboard
          </motion.h1>
          <div className="flex space-x-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Link 
                href="/leaderboard" 
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-blue-900 font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 flex items-center"
              >
                <span className="mr-2">🏆</span>
                Leaderboard
              </Link>
            </motion.div>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/login");
              }}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 flex items-center"
            >
              <span className="mr-2">👋</span>
              Logout
            </motion.button>
          </div>
        </motion.div>

        {userData && (
          <UserScore 
            name={userData.name} 
            score={userData.totalAmount} 
          />
        )}

        <div className="mt-8">
          <JeopardyBoard 
            categories={categories} 
            onAnswerSubmitted={handleAnswerSubmitted}
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 text-center text-blue-300 text-sm"
        >
          <p>© 2023 Jeopardy Quiz Game. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
}