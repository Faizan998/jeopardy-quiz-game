"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { loginSchema, type LoginFormData } from "../../utils/validationSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <div className="text-center w-full max-w-md">
        <h2 className="text-5xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          Login
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 p-8 rounded-xl w-full border border-gray-700 space-y-6">
          <input
            type="email"
            {...register("email")}
            placeholder="Email"
            disabled={isSubmitting}
            className="w-full p-3 bg-gray-900 text-gray-200 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Password"
              disabled={isSubmitting}
              className="w-full p-3 bg-gray-900 text-gray-200 border rounded-lg focus:ring-2 focus:ring-blue-400 pr-10"
            />
            <button type="button" onClick={() => setShowPassword(prev => !prev)} className="absolute inset-y-0 right-0 p-3">
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </button>
          </div>
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}

          <div className="text-right">
            <Link href="/forgot-password" className="text-blue-400 hover:underline text-sm">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-md flex justify-center items-center"
          >
            {isSubmitting && (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5 mr-2"></span>
            )}
            Login
          </button>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-400 hover:underline">
                Sign up
              </Link>
            </p>
            <p className="text-center text-gray-400 mt-4">
              <Link href="/" className="text-blue-400 hover:text-blue-300">← Back to Home</Link>
            </p>
          </div>

          {message && (
            <div className={`mt-4 text-center ${messageType === "success" ? "text-blue-600" : "text-red-400"} font-semibold`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
