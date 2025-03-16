"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";

interface LeaderboardUser {
  id: string;
  name: string;
  totalAmount: number;
  rank: number;
}

export default function Leaderboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        console.log("Token found:", token.substring(0, 20) + "..."); // Log partial token for debugging

        // Fetch leaderboard data
        const response = await axios.get("/api/user/leaderboard", {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
        
        console.log("Leaderboard data received:", response.data);
        setLeaderboardData(response.data.leaderboard);
        setCurrentUser(response.data.currentUser);
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching leaderboard data:", error);
        
        // If token is invalid, redirect to login
        if (error.response?.status === 401) {
          localStorage.removeItem("token"); // Clear invalid token
          setError("Your session has expired. Please log in again.");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else {
          setError(error.response?.data?.message || "Failed to load leaderboard data");
        }
        
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [router]);

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
      <div className="max-w-4xl mx-auto">
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
            <span className="text-yellow-400">Jeopardy</span> Leaderboard
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              href="/user-dashboard" 
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-blue-900 font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 flex items-center"
            >
              <span className="mr-2">🎮</span>
              Back to Game
            </Link>
          </motion.div>
        </motion.div>

        {/* Trophy for top 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center items-end mb-12 space-x-0 md:space-x-4 gap-6 md:gap-0"
        >
          {leaderboardData.slice(0, 3).map((user, index) => {
            const heights = ["h-24", "h-32", "h-20"];
            const positions = [1, 0, 2]; // Silver, Gold, Bronze
            const colors = ["bg-gray-300", "bg-yellow-400", "bg-yellow-700"];
            const position = positions[index];
            const delay = 0.5 + position * 0.2;
            
            return (
              <motion.div 
                key={user.id} 
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: delay + 0.2,
                    type: "spring",
                    stiffness: 300,
                    damping: 15
                  }}
                >
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-700 to-blue-800 flex items-center justify-center mb-2 mx-auto border-2 border-white shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <span className="text-white font-bold text-xl">{user.name.charAt(0)}</span>
                  </motion.div>
                  <p className="text-white font-bold text-center">{user.name}</p>
                  <p className="text-yellow-400 font-bold text-center">${user.totalAmount}</p>
                </motion.div>
                <motion.div 
                  className={`${heights[position]} ${colors[position]} w-24 rounded-t-lg flex items-center justify-center shadow-lg border border-opacity-20 border-white`}
                  initial={{ height: 0 }}
                  animate={{ height: heights[position].replace('h-', '') + 'px' }}
                  transition={{ delay: delay + 0.4, duration: 0.5 }}
                >
                  <motion.span 
                    className="text-blue-900 font-bold text-2xl flex items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: delay + 0.9 }}
                  >
                    #{position + 1}
                    {position === 0 && <span className="ml-1">👑</span>}
                  </motion.span>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Full leaderboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg overflow-hidden shadow-xl border border-blue-700"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-700 to-blue-800">
                <th className="py-4 px-4 text-left text-white font-bold">Rank</th>
                <th className="py-4 px-4 text-left text-white font-bold">Player</th>
                <th className="py-4 px-4 text-right text-white font-bold">Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((user, index) => (
                <motion.tr 
                  key={user.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.05 }}
                  className={`border-t border-blue-700 ${
                    currentUser && user.id === currentUser.id 
                      ? 'bg-blue-600' 
                      : 'hover:bg-blue-700'
                  } transition-colors`}
                >
                  <td className="py-3 px-4 text-white">
                    <div className="flex items-center">
                      {user.rank <= 3 ? (
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-blue-900 font-bold mr-2">
                          {user.rank}
                        </span>
                      ) : (
                        <span className="text-gray-300 font-bold">{user.rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white font-medium">
                    {user.name}
                    {currentUser && user.id === currentUser.id && (
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="ml-2 text-yellow-400 font-bold"
                      >
                        (You)
                      </motion.span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-yellow-400 font-bold">${user.totalAmount}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Current user's position if not in top 10 */}
        {currentUser && !leaderboardData.some(user => user.id === currentUser.id) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-6 bg-gradient-to-r from-blue-700 to-blue-800 rounded-lg p-4 shadow-lg border border-blue-600"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900 text-white font-bold mr-3">
                  {currentUser.rank}
                </span>
                <span className="text-white font-medium">{currentUser.name} <span className="text-yellow-400 font-bold">(You)</span></span>
              </div>
              <span className="text-yellow-400 font-bold text-xl">${currentUser.totalAmount}</span>
            </div>
          </motion.div>
        )}
        
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