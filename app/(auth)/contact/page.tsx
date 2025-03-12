"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setResponseMessage("");

    try {
      const res = await axios.post("/api/contact", formData, {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      });

      if (res.status === 200) {
        setResponseMessage("Message sent successfully! Check your email.");
        setFormData({ name: "", email: "", message: "" });
      }
    } catch (error: any) {
      console.error("Error sending contact form:", error.response?.data || error.message);
      setResponseMessage(
        error.response?.data?.message || "Failed to send message. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <div className="bg-gray-800 bg-opacity-80 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-400">Contact Us</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-gray-200 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-200 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-gray-200 mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              disabled={isLoading}
              rows={4}
              className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer p-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-800 disabled:bg-gray-600 transition-all"
          >
            {isLoading ? "Sending..." : "Send Message"}
          </button>

          {responseMessage && (
            <p
              className={`text-center ${
                responseMessage.includes("success") ? "text-blue-400" : "text-red-700"
              }`}
            >
              {responseMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
