"use client"; // Client Component

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation"; // Import useRouter
import { setUser } from "../../redux/feature/userSlice";
import axios from "axios";

export default function Login() {
  const dispatch = useDispatch();
  const router = useRouter(); // Initialize Router
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/login", formData, {
        headers: { "Content-Type": "application/json" },
      });

      const data = res.data;
      if (res.status === 200) {
        localStorage.setItem("token", data.token); // Store JWT in localStorage
        dispatch(setUser({
            name: data.name, email: formData.email, token: data.token,
          
        }));
        setMessage("Login successful! Redirecting... ✅");
        setMessageType("success");
        setFormData({ email: "", password: "" });

        // Redirect to User Dashboard
        router.push("/user-dashboard");
      } else {
        setMessage(data.message || "Unexpected error occurred. Please try again.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setMessage("Login failed. Please check your credentials and try again.");
      setMessageType("error");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat text-white p-6 transition-all duration-500 ease-in-out">
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      <div className="relative z-10 text-center space-y-6 w-full max-w-md animate-fade-in">
        <h2 className="text-5xl font-extrabold tracking-widest drop-shadow-lg text-blue-500 hover:text-blue-600 animate-pulse">
          Login
        </h2>
        <p className="text-lg font-medium opacity-90">Welcome back to Jeopardy Quiz Challenge!</p>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-lg w-full text-black space-y-4 animate-zoom-in"
        >
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={formData.email}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            value={formData.password}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-transform duration-300 shadow-md"
          >
            Login
          </button>

          {message && (
            <p className={`mt-4 font-bold text-lg ${messageType === "success" ? "text-blue-900" : "text-red-500"} animate-pulse`}>
              {message}
            </p>
          )}
        </form>
      </div>
      <footer className="absolute bottom-4 text-sm opacity-70 animate-fade-in">
        <p>© 2025 Jeopardy Game. All rights reserved.</p>
      </footer>
    </div>
  );
}
