"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify"; // Import toastify components
import "react-toastify/dist/ReactToastify.css"; // Import the styles for Toastify
import { motion } from "framer-motion"; // Import motion for button animation

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/user/forgot-password", { email });

      if (res.status === 200) {
        toast.success("Password reset link sent! Check your email. 📧"); // Show success toast
        setEmail(""); // Clear the email field after successful submission
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
      console.error("Error:", error.response?.data || error);
        toast.error(error.response?.data?.message || "Failed to send reset link."); // Show error toast
      } else {
        console.error("Error:", error);
        toast.error("An unexpected error occurred. Please try again later."); // Show generic error toast
      }
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
          <motion.button
            type="submit"
            className="w-full p-3 cursor-pointer bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg shadow-md transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed hover:scale-105 relative overflow-hidden flex justify-center items-center"
            disabled={loading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              <span className="flex justify-center items-center">
                <motion.span
                  className="border-2 border-white border-t-transparent rounded-full w-5 h-5 mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Sending...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </motion.button>

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

      {/* Updated Toast Container */}
      <ToastContainer
        position="top-right"  // Set position to top-right
        autoClose={5000}  // Automatically close the toast after 5 seconds
        hideProgressBar={false}  // Show progress bar
        newestOnTop={false}  // Show the newest toast on the top
        closeOnClick
        rtl={false}  // For right-to-left languages, you can set this to true
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
