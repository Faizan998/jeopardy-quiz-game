"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function UpdatePassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // Get token from query parameters
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        setTimeout(() => router.push("/login"), 2000); // Redirect to login after 2s
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-500 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <h2 className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse drop-shadow-lg">
        Update Password
      </h2>

      <div className="bg-gray-800 bg-opacity-80 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6 border border-gray-700">
        {token ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-gray-300 text-lg text-center">Reset your password</p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              disabled={isLoading}
              className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-md hover:shadow-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed hover:scale-105 relative overflow-hidden"
            >
              {isLoading ? (
                <>
                  <span className="relative z-10">Updating...</span>
                  <div className="absolute inset-0 h-full bg-blue-400 opacity-50 animate-loading-bar"></div>
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        ) : (
          <p className="text-red-500 text-center">No token provided. Please use the reset link sent to your email.</p>
        )}

        {message && (
          <p className={`text-center font-semibold ${message.includes("success") ? "text-blue-400" : "text-red-500"} transition-opacity duration-300`}>
            {message}
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes loadingBar {
          0% {
            width: 0;
            left: 0;
          }
          50% {
            width: 100%;
            left: 0;
          }
          100% {
            width: 0;
            left: 100%;
          }
        }
        .animate-loading-bar {
          animation: loadingBar 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
