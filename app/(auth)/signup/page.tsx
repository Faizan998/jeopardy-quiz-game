"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
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
  const [googleLoading, setGoogleLoading] = useState(false);
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

    // Clear validation error for this field when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    try {
      signupSchema.parse(formData); // Validate the form data
      setValidationErrors({}); // Clear errors if validation passes
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0]?.toString();
          if (field) {
            newErrors[field] = err.message;
          }
        });
        setValidationErrors(newErrors);
        return false;
      }
      return false; // Handle unexpected errors
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    setIsLoading(true);
    try {
      const res = await axios.post("/api/signup", formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 201) {
        setMessage("Signup successful! You can now log in.");
        setMessageType("success");
        setFormData({ name: "", email: "", password: "" }); // Reset form
      } else {
        setMessage(res.data.message || "Unexpected error occurred.");
        setMessageType("error");
      }
    } catch (error: any) {
      console.error("Signup Error:", error.response?.data || error);
      setMessage(error.response?.data?.message || "Signup failed. Try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    signIn("google").then(() => {
      router.refresh();
      setGoogleLoading(false);
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-500 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <h2 className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse drop-shadow-lg">
        Signup
      </h2>

      {session ? (
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-lg p-6 rounded-xl shadow-2xl w-full max-w-md text-center border border-gray-700">
          <p className="text-lg text-gray-300">Signed in as {session.user?.email}</p>
          <button
            onClick={() => signOut()}
            className="mt-4 w-full p-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg shadow-md hover:shadow-xl hover:from-red-600 hover:to-red-800 transition-all duration-300"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 bg-opacity-80 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6 border border-gray-700"
        >
          <div>
            <input
              type="text"
              name="name"
              placeholder="Name"
              onChange={handleChange}
              value={formData.name}
              required
              disabled={isLoading}
              className={`w-full p-3 bg-gray-900 text-gray-200 border ${
                validationErrors.name ? "border-red-500" : "border-gray-600"
              } rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 disabled:opacity-50`}
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              value={formData.email}
              required
              disabled={isLoading}
              className={`w-full p-3 bg-gray-900 text-gray-200 border ${
                validationErrors.email ? "border-red-500" : "border-gray-600"
              } rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 disabled:opacity-50`}
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
              disabled={isLoading}
              className={`w-full p-3 bg-gray-900 text-gray-200 border ${
                validationErrors.password ? "border-red-500" : "border-gray-600"
              } rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 disabled:opacity-50`}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200 transition-colors duration-200"
              disabled={isLoading}
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer p-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-md hover:shadow-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed hover:scale-105 relative overflow-hidden"
          >
            {isLoading ? (
              <>
                <span className="relative z-10">Signing Up...</span>
                <div className=" absolute inset-0 h-full bg-blue-400 opacity-50 animate-loading-bar"></div>
              </>
            ) : (
              "Signup"
            )}
          </button>

          <p className="text-center text-gray-400 font-medium">OR</p>

          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="cursor-pointer flex items-center justify-center gap-3 w-full p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed hover:scale-105 relative overflow-hidden"
          >
            {googleLoading ? (
              <>
                <span className="relative z-10">Processing...</span>
                <div className=" absolute inset-0 h-full bg-indigo-400 opacity-50 animate-loading-bar"></div>
              </>
            ) : (
              <>
                <FcGoogle className="text-2xl" />
                Sign in with Google
              </>
            )}
          </button>

          {message && (
            <p
              className={`mt-4 text-center font-semibold ${
                messageType === "success"
                  ? "text-blue-400 hover:text-blue-300 transition-colors duration-200"
                  : "text-red-700"
              } transition-opacity duration-300`}
            >
              {message}
            </p>
          )}

          <p className="text-center text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
              Login
            </Link>
          </p>
        </form>
      )}
      <style jsx>{`
        @keyframes loadingBar {
          0% {
            width: 0;
            left: 0;
          }
          50% {
            width: 100%;
            left: 0;
          }
          100% {
            width: 0;
            left: 100%;
          }
        }
        .animate-loading-bar {
          animation: loadingBar 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}