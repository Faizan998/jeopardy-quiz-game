"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { loginSchema, type LoginFormData } from "../../utils/validationSchemas";
import { ZodError } from "zod";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    try {
      loginSchema.parse(formData);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setValidationErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        "/api/login",
        {
          email: formData.email,
          password: formData.password,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      const data = res.data;

      if (res.status === 200 && data.token) {
        localStorage.setItem("token", data.token);
        if (data.name) {
          localStorage.setItem("userName", data.name);
        }
        setMessage("Login successful! Redirecting... ✅");
        setMessageType("success");

        setTimeout(() => {
          router.push(data.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
        }, 1500);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Error during login:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please check your credentials or try again later.";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-500 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <div className="relative z-10 text-center space-y-6 w-full max-w-md">
        <h2 className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse drop-shadow-lg">
          Login
        </h2>
        <p className="text-lg text-gray-300">Welcome back to Jeopardy Quiz Challenge!</p>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 bg-opacity-80 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-full space-y-6 relative border border-gray-700"
        >
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              value={formData.email}
              required
              disabled={loading}
              className={`w-full p-3 bg-gray-900 text-gray-200 border ${validationErrors.email ? 'border-red-500' : 'border-gray-600'} rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 disabled:opacity-50`}
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
            )}
          </div>
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              value={formData.password}
              required
              disabled={loading}
              className={`w-full p-3 bg-gray-900 text-gray-200 border ${validationErrors.password ? 'border-red-500' : 'border-gray-600'} rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 pr-10`}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200 transition-colors duration-200"
              disabled={loading}
            >
              {showPassword ? (
                <AiOutlineEyeInvisible className="text-xl" />
              ) : (
                <AiOutlineEye className="text-xl" />
              )}
            </button>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link href="/forgot-password" className="text-blue-400 hover:underline text-sm">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button with Loading */}
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-md flex justify-center items-center"
          >
            {loading && (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5 mr-2"></span>
            )}
            Login
          </button>

          {/* Back to Signup Link */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-400 hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          {/* Login Message at the Bottom */}
          {message && (
            <div className="mt-4 text-center text-blue-400 font-semibold">
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
