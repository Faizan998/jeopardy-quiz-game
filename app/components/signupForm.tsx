"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import {
  signupSchema,
  type SignupFormData,
} from "@/app/utils/validationSchema";
import { motion } from "framer-motion";

export default function Signup() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.role === "ADMIN") {
      router.push("/admin-dashboard");
    } else if (session?.user?.role === "USER") {
      router.push("/user-dashboard");
    }
  }, [session, status, router]);

  const onSubmit = async (data: SignupFormData) => {
    setMessage("");

    try {
      const res = await axios.post("/api/signup", data, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 201) {
        setMessage("Signup successful! Redirecting to login...");
        setMessageType("success");
        reset();

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setMessage(res.data.message || "Unexpected error occurred.");
        setMessageType("error");
      }
    } catch (error: any) {
      console.error("Signup Error:", error.response?.data || error);
      setMessage(error.response?.data?.message || "Signup failed. Try again.");
      setMessageType("error");
    }
  };

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
                Math.random() * 100 - 50 + "%",
              ],
              y: [
                Math.random() * 100 - 50 + "%",
                Math.random() * 100 - 50 + "%",
                Math.random() * 100 - 50 + "%",
              ],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 15 + i * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      <motion.h2
        className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        Signup
      </motion.h2>

      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Name Field */}
        <motion.div
          className="mb-4"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-gray-400 mb-1">Name</label>
          <input
            type="text"
            {...register("name")}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
          />
          {errors.name && (
            <motion.p
              className="text-red-500 text-sm mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.name.message}
            </motion.p>
          )}
        </motion.div>

        {/* Email Field */}
        <motion.div
          className="mb-4"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-gray-400 mb-1">Email</label>
          <input
            type="email"
            {...register("email")}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
          />
          {errors.email && (
            <motion.p
              className="text-red-500 text-sm mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.email.message}
            </motion.p>
          )}
        </motion.div>

        {/* Password Field */}
        <motion.div
          className="mb-6 relative"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <label className="block text-gray-400 mb-1">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
          />
          <motion.button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-10 right-3 text-gray-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </motion.button>
          {errors.password && (
            <motion.p
              className="text-red-500 text-sm mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.password.message}
            </motion.p>
          )}
        </motion.div>

        {/* Signup Button */}
        <motion.button
          type="submit"
          className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg shadow-lg transition-all duration-300 font-bold"
          disabled={isSubmitting}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
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
              Signing up...
            </span>
          ) : (
            "Signup"
          )}
        </motion.button>

        <motion.button
          onClick={() =>
            signIn("google", {
              callbackUrl: "/admin-dashboard",
              redirect: false,
            })
          }
          type="button"
          className="mt-4 w-full p-3 flex items-center justify-center bg-white text-gray-800 rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-300 font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <FcGoogle className="text-2xl mr-2" /> Sign up with Google
        </motion.button>

        <motion.p
          className="text-center text-gray-400 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
          >
            ← Back to Home
          </Link>
        </motion.p>
      </motion.form>

      {/* Success/Error Message */}
      {message && (
        <motion.p
          className={`text-center mt-4 ${
            messageType === "success" ? "text-blue-400" : "text-red-400"
          } font-semibold`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {message}
        </motion.p>
      )}

      {/* Redirect to Login */}
      <motion.p
        className="text-center text-gray-400 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
        >
          Login
        </Link>
      </motion.p>
    </div>
  );
}
