"use client";

import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data:any) => {
    setIsLoading(true);
    setResponseMessage("");
    try {
      const res = await axios.post("/api/contact", data, {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      });
      if (res.status === 200) {
        setResponseMessage("Message sent successfully! Check your email.");
        reset();
      }
    } catch (error:any) {
      console.error("Error sending contact form:", error.response?.data || error.message);
      setResponseMessage(error.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <div className="bg-gray-800 bg-opacity-80 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-400">Contact Us</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-gray-200 mb-1">Name</label>
            <input
              type="text"
              {...register("name")}
              disabled={isLoading}
              className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-gray-200 mb-1">Email</label>
            <input
              type="email"
              {...register("email")}
              disabled={isLoading}
              className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-gray-200 mb-1">Message</label>
            <textarea
              {...register("message")}
              disabled={isLoading}
              rows={4}
              className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer p-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-800 disabled:bg-gray-600 transition-all"
          >
            {isLoading ? "Sending..." : "Send Message"}
          </button>
          {responseMessage && (
            <p className={`text-center ${responseMessage.includes("success") ? "text-blue-400" : "text-red-700"}`}>
              {responseMessage}
            </p>
            
          )}
            <p className="text-center text-gray-400 mt-4">
        <Link href="/" className="text-blue-400 hover:text-blue-300">← Back to Home</Link>
      </p> 
        </form>
        
      </div>
    </div>
  );
}
