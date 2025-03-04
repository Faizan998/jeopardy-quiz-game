"use client"; // 🔥 Zaroori hai taaki ye Client Component bane

import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/feature/userSlice";
import axios from "axios";
import { useSession, signIn, signOut } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";

export default function Signup() {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/signup", formData, {
        headers: { "Content-Type": "application/json" },
      });

      const data = res.data;
      if (res.status === 201) {
        dispatch(setUser({ name: formData.name, email: formData.email }));
        setMessage("Signup successful! ✅");
        setFormData({ name: "", email: "", password: "" });
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setMessage("Signup failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-purple-800 p-6">
      <motion.h2
        className="text-4xl font-extrabold text-white mb-6 drop-shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Signup
      </motion.h2>

      {session ? (
        <motion.div
          className="bg-white p-6 rounded-lg shadow-lg text-center w-80"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-lg font-bold">Signed in as {session.user?.email}</p>
          <button
            onClick={() => signOut()}
            className="mt-4 w-full p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md"
          >
            Sign Out
          </button>
        </motion.div>
      ) : (
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            value={formData.name}
            required
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={formData.email}
            required
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            value={formData.password}
            required
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md"
          >
            Signup
          </button>
          <motion.p
        className="text-blue-600 text-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        OR
      </motion.p>

      <motion.button
        onClick={() => signIn("google")}
        className="mt-4 flex items-center justify-center gap-3 w-full max-w-md p-3 bg-blue-700  text-white rounded-lg hover:bg-blue-800 transition-all duration-300 shadow-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <FcGoogle className="text-2xl" /> Sign in with Google
      </motion.button>

      {message && (
        <motion.p
          className="mt-4 text-green-500 font-bold text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {message}
        </motion.p>
      )}
        </motion.form>
      )}

     
    </div>
  );
}
