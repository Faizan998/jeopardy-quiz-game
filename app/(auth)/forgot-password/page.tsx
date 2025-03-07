"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("/api/forgot-password", { email });

      if (res.status === 200) {
        setMessage("Password reset link sent! Check your email. 📧");
        setMessageType("success");
      }
    } catch (error: any) {
      console.error("Error:", error.response?.data || error);
      setMessage(error.response?.data?.message || "Failed to send reset link.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-500 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <div className="relative z-10 text-center space-y-6 w-full max-w-md">
        <h2 className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse drop-shadow-lg">
          Forgot Password
        </h2>
        <p className="text-lg text-gray-300">Enter your email to reset your password.</p>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 bg-opacity-80 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-full space-y-6 relative border border-gray-700"
        >
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
            disabled={loading}
            className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded-lg placeholder-gray-500 
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-md hover:shadow-xl 
              hover:from-blue-600 hover:to-blue-800 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed hover:scale-105 
              relative overflow-hidden flex justify-center items-center"
          >
            {loading ? (
              <span className="relative z-10">Sending...</span>
            ) : (
              "Send Reset Link"
            )}
          </button>

          {message && (
            <p
              className={`mt-4 text-center font-semibold ${
                messageType === "success" ? "text-blue-400 hover:text-blue-300 transition-colors duration-200" : "text-red-400"
              } transition-opacity duration-300`}
            >
              {message}
            </p>
          )}

          {/* Back to Login Link */}
          <p className="text-center text-gray-400">
            Remember your password?{" "}
            <Link href="/login" className="relative inline-block text-blue-400 transition-all duration-300 group">
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              <span className="group-hover:text-blue-300 transition-colors duration-300">Login</span>
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
