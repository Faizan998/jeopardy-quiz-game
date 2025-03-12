"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  totalAmount: number;
  image?: string;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        
        // Get current user ID from localStorage or session
        const userId = localStorage.getItem("userId");
        setCurrentUser(userId);
        
        // Fetch leaderboard data
        const response = await axios.get("/api/leaderboard");
        
        if (response.status === 200) {
          setUsers(response.data);
        } else {
          throw new Error("Failed to fetch leaderboard data");
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Leaderboard</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Player</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {users.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-300">
                  No data available
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr 
                  key={user.id} 
                  className={`${user.id === currentUser ? 'bg-blue-900 bg-opacity-50' : index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'} hover:bg-gray-600`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-200">
                        {index + 1}
                        {index < 3 && (
                          <span className="ml-2">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.image ? (
                        <img 
                          className="h-8 w-8 rounded-full mr-3" 
                          src={user.image} 
                          alt={`${user.name}'s avatar`} 
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                          <span className="text-white font-medium">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div className="text-sm font-medium text-gray-200">
                        {user.name}
                        {user.id === currentUser && <span className="ml-2 text-xs text-blue-400">(You)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {user.totalAmount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 