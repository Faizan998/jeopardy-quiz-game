"use client";

import { useState, useEffect } from "react";
import {  useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { signupSchema, type SignupFormData } from "../../utils/validationSchemas";
import { ZodError } from "zod";

export default function Signup() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState<SignupFormData>({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.role === "ADMIN") {
      router.push("/admin-dashboard");
    } else if (session?.user?.role === "USER") {
      router.push("/user-dashboard");
    }
  }, [session, status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setValidationErrors({});
    setMessage("");

    try {
      signupSchema.parse(formData);

      const res = await axios.post("/api/signup", formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 201) {
        setMessage("Signup successful! You can now log in.");
        setMessageType("success");
        setFormData({ name: "", email: "", password: "" });
      } else {
        setMessage(res.data.message || "Unexpected error occurred.");
        setMessageType("error");
      }
    } catch (error: any) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0]] = err.message;
          }
        });
        setValidationErrors(errors);
      } else {
        console.error("Signup Error:", error.response?.data || error);
        setMessage(error.response?.data?.message || "Signup failed. Try again.");
        setMessageType("error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <h2 className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
        Signup
      </h2>

      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="mb-4">
          <label className="block text-gray-400">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {validationErrors.name && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-400">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {validationErrors.email && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
          )}
        </div>

        <div className="mb-4 relative">
          <label className="block text-gray-400">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-10 right-3 text-gray-400"
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </button>
          {validationErrors.password && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          disabled={isLoading}
        >
          {isLoading ? "Signing up..." : "Signup"}
        </button>
        <button
          onClick={() => signIn("google", {
            callbackUrl: "/admin-dashboard",
            redirect: false,
          })}
          className="mt-4 w-full p-3 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
        >
          <FcGoogle className="text-2xl mr-2" /> Sign up with Google
        </button>
      </form>

      {message && (
        <p className={`text-center mt-4 ${messageType === "success" ? "text-blue-500" : "text-red-700"} font-semibold`}>
          {message}
        </p>
      )}

      <p className="text-center text-gray-400 mt-4">
        Already have an account? <Link href="/login" className="text-blue-400 hover:text-blue-300">Login</Link>
      </p>
    </div>
  );
}
