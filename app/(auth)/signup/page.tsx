"use client"; // Client Component

import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/feature/userSlice";
import axios from "axios";
import { useSession, signIn, signOut } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";


export default function Signup() {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const handleChange = (e:any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/signup", formData, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("res", res);

      const data = res.data;
      if (res.status === 201) {
        localStorage.setItem("token", data.token); // Store JWT in localStorage
        dispatch(setUser({ name: formData.name, email: formData.email, token: data.token }));
        setMessage("Signup successful! Welcome to Jeopardy Quiz Challenge. ");
        setMessageType("success");
        setFormData({ name: "", email: "", password: "" });
      } else {
        setMessage(data.message || "Unexpected error occurred. Please try again.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setMessage("Signup failed. Please check your details and try again.");
      setMessageType("error");
    }
  };
  

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat text-white p-6 transition-all duration-500 ease-in-out"
    >
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      <div className="relative z-10 text-center space-y-6 w-full max-w-md animate-fade-in">
        <h2 className="text-5xl font-extrabold tracking-widest drop-shadow-lg text-blue-500 hover:text-blue-600 animate-pulse">
          Signup
        </h2>
        <p className="text-lg font-medium opacity-90">Join the Jeopardy Quiz Challenge!</p>

        {session ? (
          <div className="bg-white p-6 rounded-lg shadow-lg text-black text-center w-full animate-slide-in">
            <p className="text-lg font-bold">Signed in as {session.user?.email}</p>
            <button
              onClick={() => signOut()}
              className="mt-4 w-full p-3 bg-red-700 hover:bg-red-600 text-white rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-lg shadow-lg w-full text-black space-y-4 animate-zoom-in"
          >
            <input
              type="text"
              name="name"
              placeholder="Name"
              onChange={handleChange}
              value={formData.name}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
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
              Signup
            </button>

            <p className="text-blue-600 text-center mt-4">OR</p>

            <button
              onClick={() => signIn("google")}
              className="mt-4 flex items-center justify-center gap-3 w-full p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transform hover:scale-105 transition-transform duration-300 shadow-md"
            >
              <FcGoogle className="text-2xl" /> Sign in with Google
            </button>

            {message && (
              <p className={`mt-4 font-bold text-lg ${messageType === "success" ? "text-blue-900" : "text-red-500"} animate-pulse`}>
                {message}
              </p>
            )}
          </form>
        )}
      </div>
      <footer className="absolute bottom-4 text-sm opacity-70 animate-fade-in">
        <p>© 2025 Jeopardy Game. All rights reserved.</p>
      </footer>
    </div>
  );
}
