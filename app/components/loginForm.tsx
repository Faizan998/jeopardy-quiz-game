"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { loginSchema, type LoginFormData } from "@/app/utils/validationSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false); // Fix hydration issue

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("/api/login", data, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });

      if (res.status === 200 && res.data.token) {
        if (isClient) {
          localStorage.setItem("token", res.data.token);
          if (res.data.name) {
            localStorage.setItem("userName", res.data.name);
          }
        }
        setMessage("Login successful! Redirecting... ✅");
        setMessageType("success");

        setTimeout(() => {
          router.push(res.data.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
        }, 1500);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Login failed. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null; // Prevent hydration error

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black overflow-hidden">
      {/* Background animated elements */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1 }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-500 opacity-20 blur-3xl"
            initial={{ 
              x: Math.random() * 100 - 50 + "%", 
              y: Math.random() * 100 - 50 + "%",
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
            }}
            animate={{ 
              x: [
                Math.random() * 100 - 50 + "%", 
                Math.random() * 100 - 50 + "%", 
                Math.random() * 100 - 50 + "%"
              ],
              y: [
                Math.random() * 100 - 50 + "%", 
                Math.random() * 100 - 50 + "%", 
                Math.random() * 100 - 50 + "%"
              ],
            }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "reverse", 
              duration: 15 + i * 5,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      <motion.div 
        className="text-center w-full max-w-md z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2 
          className="text-5xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          Login
        </motion.h2>
        <motion.form 
          onSubmit={handleSubmit(onSubmit)} 
          className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl w-full border border-gray-700 space-y-6 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <input
              type="email"
              {...register("email")}
              placeholder="Email"
              disabled={isSubmitting}
              className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-300"
            />
            {errors.email && (
              <motion.p 
                className="text-red-500 mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.email.message}
              </motion.p>
            )}
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Password"
              disabled={isSubmitting}
              className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-400 pr-10 transition-all duration-300"
            />
            <motion.button 
              type="button" 
              onClick={() => setShowPassword(prev => !prev)} 
              className="absolute inset-y-0 right-0 p-3 text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </motion.button>
            {errors.password && (
              <motion.p 
                className="text-red-500 mt-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.password.message}
              </motion.p>
            )}
          </motion.div>

          <motion.div 
            className="text-right"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 hover:underline text-sm transition-colors">
              Forgot Password?
            </Link>
          </motion.div>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg shadow-lg transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {isSubmitting ? (
              <span className="flex justify-center items-center">
                <motion.span 
                  className="border-2 border-white border-t-transparent rounded-full w-5 h-5 mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </motion.button>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                Sign up
              </Link>
            </p>
            <p className="text-center text-gray-400 mt-4">
              <Link href="/" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                ← Back to Home
              </Link>
            </p>
          </motion.div>

          {message && (
            <motion.div 
              className={`mt-4 text-center ${messageType === "success" ? "text-green-400" : "text-red-400"} font-semibold`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {message}
            </motion.div>
          )}
        </motion.form>
      </motion.div>
    </div>
  );
}