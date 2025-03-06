"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUser } from "../../redux/feature/userSlice";
import axios from "axios";
import Link from "next/link";

export default function Login() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/api/login", formData, {
        headers: { "Content-Type": "application/json" },
      });

      const data = res.data;
      if (res.status === 200) {
        localStorage.setItem("token", data.token);
        dispatch(setUser({ name: data.name, email: formData.email, token: data.token }));

        setMessage("Login successful! Redirecting... ✅");
        setMessageType("success");
        setTimeout(() => router.push(data.role === "admin" ? "/admin-dashboard" : "/user-dashboard"), 1500);
      }
    } catch (error: any) {
      console.error("Error during login:", error.response?.data || error);
      setMessage(error.response?.data?.message || "Login failed. Please check your credentials.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
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
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={formData.email}
            required
            disabled={loading}
            className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 disabled:opacity-50"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            value={formData.password}
            required
            disabled={loading}
            className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-md hover:shadow-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed hover:scale-105 relative overflow-hidden flex justify-center items-center"
          >
            {loading ? (
              <>
                <span className="relative z-10">Logging In...</span>
                <div className="absolute inset-0 h-full bg-blue-400 opacity-50 animate-loading-bar"></div>
              </>
            ) : (
              "Login"
            )}
          </button>

          {message && (
            <p
              className={`mt-4 text-center font-semibold ${
                messageType === "success" ? "text-blue-400 hover:text-blue-300 transition-colors duration-200" : "text-red-400"
              } transition-opacity duration-300`}
            >
              {message}
            </p>
          )}

          {/* Signup Link */}
          <p className="text-center text-gray-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
              Signup
            </Link>
          </p>
        </form>
      </div>
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