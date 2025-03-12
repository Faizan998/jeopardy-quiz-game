"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { signIn, useSession } from "next-auth/react";
import { loginSchema, type LoginFormData } from "../../utils/validationSchemas";
import { ZodError } from "zod";
import { useEffect } from "react";

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (status === "loading") return;
    
    if (session?.user) {
      if (session.user.role === "ADMIN") {
        router.push("/admin-dashboard");
      } else {
        router.push("/user-dashboard");
      }
    }
  }, [session, status, router]);

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
    } catch (error:any) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
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
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setMessage(result.error === "CredentialsSignin" 
          ? "Invalid email or password" 
          : result.error);
        setMessageType("error");
      } else {
        setMessage("Login successful! Redirecting...");
        setMessageType("success");
        
        // The session will be updated automatically by NextAuth
        // and the useEffect above will handle the redirect
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setMessage("An unexpected error occurred. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/user-dashboard" });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setMessage("Failed to sign in with Google. Please try again.");
      setMessageType("error");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <div className="text-center w-full max-w-md">
        <h2 className="text-5xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl w-full border border-gray-700 space-y-6">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={formData.email}
            required
            disabled={loading}
            className="w-full p-3 bg-gray-900 text-gray-200 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
          {validationErrors.email && <p className="text-red-500 text-sm">{validationErrors.email}</p>}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              value={formData.password}
              required
              disabled={loading}
              className="w-full p-3 bg-gray-900 text-gray-200 border rounded-lg focus:ring-2 focus:ring-blue-400 pr-10"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(prev => !prev)} 
              className="absolute inset-y-0 right-0 p-3 text-gray-400"
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </button>
          </div>
          {validationErrors.password && <p className="text-red-500 text-sm">{validationErrors.password}</p>}

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
          
          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full p-3 bg-gray-700 text-white rounded-lg shadow-md flex justify-center items-center mt-4"
          >
            <FcGoogle className="text-2xl mr-2" /> Sign in with Google
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
            <div className={`mt-4 text-center ${messageType === "success" ? "text-green-400" : "text-red-400"} font-semibold`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
