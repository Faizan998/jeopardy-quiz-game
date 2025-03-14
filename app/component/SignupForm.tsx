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
import { signupSchema, type SignupFormData } from "@/app/utils/validationSchemas";

export default function Signup() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <h2 className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
        Signup
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700"
      >
        {/* Name Field */}
        <div className="mb-4">
          <label className="block text-gray-400">Name</label>
          <input
            type="text"
            {...register("name")}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label className="block text-gray-400">Email</label>
          <input
            type="email"
            {...register("email")}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="mb-4 relative">
          <label className="block text-gray-400">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-10 right-3 text-gray-400"
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </button>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        {/* Signup Button */}
        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing up..." : "Signup"}
        </button>

        {/* Google Signup Button */}
        <button
          onClick={() =>
            signIn("google", {
              callbackUrl: "/admin-dashboard",
              redirect: false,
            })
          }
          type="button"
          className="mt-4 w-full p-3 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
        >
          <FcGoogle className="text-2xl mr-2" /> Sign up with Google
        </button>
        <p className="text-center text-gray-400 mt-4">
        <Link href="/" className="text-blue-400 hover:text-blue-300">← Back to Home</Link>
      </p>
      </form>

      {/* Success/Error Message */}
      {message && (
        <p className={`text-center mt-4 ${messageType === "success" ? "text-blue-500" : "text-red-700"} font-semibold`}>
          {message}
        </p>
      )}

      {/* Redirect to Login */}
      <p className="text-center text-gray-400 mt-4">
        Already have an account? <Link href="/login" className="text-blue-400 hover:text-blue-300">Login</Link>
      </p>
       
    </div>
    
  );
}
