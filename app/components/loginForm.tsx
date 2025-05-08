"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { motion } from "framer-motion";
import Link from "next/link";
import { loginSchema, type LoginFormData } from "@/app/utils/validationSchema";
import { FcGoogle } from "react-icons/fc";
import { toast, ToastContainer } from "react-toastify"; // Importing toast and ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import the toast styles

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState(false); // Prevents hydration error

  const { data: session, status } = useSession();
  
  useEffect(() => {
    if (status === "loading") return;
    
    // Redirect user based on their role once the session is loaded
    if (session?.user?.role === "ADMIN") {
      router.push("/admin-dashboard");
    } else if (session?.user?.role === "USER") {
      router.push("/game");
    }

    setIsClient(true);
  }, [session, status, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false, // Prevent automatic redirect, we want to handle it manually
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success("Login successful! Redirecting... ✅");

      // Wait for the session to be updated, then redirect to the game page
      setTimeout(() => {
        router.push("/game");
      }, 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed. Please try again.");
    }
  };

  if (!isClient) return null; // Prevent hydration error

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black p-6">
      <motion.div
        className="text-center w-full max-w-md bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400 mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Input */}
          <div>
            <input
              type="email"
              {...register("email")}
              placeholder="Email"
              disabled={isSubmitting}
              className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-400"
            />
            {errors.email && <p className="text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Password"
              disabled={isSubmitting}
              className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-400 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 p-3 text-gray-400 hover:text-white"
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </button>
            {errors.password && <p className="text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 hover:underline text-sm">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <motion.button
          type="submit"
          className="w-full p-3 cursor-pointer bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg shadow-lg transition-all duration-300 font-bold"
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
              Login...
            </span>
          ) : (
            "Login"
          )}
        </motion.button>
        </form>

        {/* Google Signup Button */}
        <motion.button
          onClick={() =>
            signIn("google", {
              callbackUrl: "/admin-dashboard ",
              redirect: false,
            })
          }
          type="button"
          className="mt-4 w-full cursor-pointer p-3 flex items-center justify-center bg-white text-gray-800 rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-300 font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <FcGoogle className="text-2xl mr-2" /> Sign in with Google
        </motion.button>

        {/* Signup & Home Links */}
        <div className="text-center text-gray-400 mt-4">
          <p>
            Do not have an account?{" "}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 hover:underline">
              Sign up
            </Link>
          </p>
          <p className="mt-2">
            <Link href="/" className="text-blue-400 hover:text-blue-300 hover:underline">
              ← Back to Home
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Toast Container */}
      <ToastContainer
       position="top-right"  // Set position to top-right
       autoClose={5000}  // Automatically close the toast after 5 seconds
       hideProgressBar={false}  // Show progress bar
       newestOnTop={false}  // Show the newest toast on the top
       closeOnClick
       rtl={false}  // For right-to-left languages, you can set this to true
       pauseOnFocusLoss
       draggable
       pauseOnHover />
    </div>
  );
}
