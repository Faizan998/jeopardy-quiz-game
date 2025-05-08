"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Zod schema for validation (without recaptcha)
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  // Handle reCAPTCHA verification
  const handleCaptchaChange = async (token: string | null) => {
    if (token) {
      try {
        const response = await axios.post("/api/verify-captcha", { token });

        if (response.data.success) {
          setIsVerified(true);
        } else {
          setIsVerified(false);
          toast.error("reCAPTCHA verification failed. Please try again.");
        }
      } catch (error) {
        console.error("Error verifying reCAPTCHA:", error);
        setIsVerified(false);
        toast.error("Error verifying reCAPTCHA. Please try again.");
      }
    } else {
      setIsVerified(false);
    }
  };

  const onSubmit = async (data: ContactFormData) => {
    // Check if reCAPTCHA is verified first before doing the rest of the validation
    if (!isVerified) {
      toast.error("Please complete the reCAPTCHA verification.");
      return;
    }

    // Manually validate with Zod before submitting
    const validationResult = contactSchema.safeParse(data);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((err) => err.message);
      toast.error(`Validation Error: ${errorMessages.join(", ")}`);
      return;
    }

    setIsLoading(true);
    toast.info("Processing your message...");

    try {
      const res = await axios.post("/api/contact", data, {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      });

      if (res.status === 200) {
        toast.success("Message sent successfully! Check your email.");
        reset();
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setIsVerified(false);
        setFormKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!recaptchaSiteKey) {
    console.error("reCAPTCHA site key is not configured");
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        <div className="bg-gray-800 bg-opacity-80 p-8 rounded-xl shadow-2xl w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6 text-red-400">Configuration Error</h1>
          <p className="text-gray-200 text-center">
            The contact form is currently unavailable due to a configuration error.
            Please try again later.
          </p>
          <p className="text-center text-gray-400 mt-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300">← Back to Home</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <div className="bg-gray-800 bg-opacity-80 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-400">Contact Us</h1>
        <form
          key={formKey}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          suppressHydrationWarning
        >
          <div>
            <label className="block text-gray-200 mb-1">Name</label>
            <input
              type="text"
              {...register("name")}
              disabled={isLoading}
              className="w-full p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              suppressHydrationWarning
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
              suppressHydrationWarning
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
              suppressHydrationWarning
            />
            {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
          </div>

          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={recaptchaSiteKey}
              onChange={handleCaptchaChange}
              theme="dark"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !isVerified}
            className="w-full cursor-pointer p-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-800 disabled:bg-gray-600 transition-all flex items-center justify-center"
          >
            {isLoading ? (
              <>
                {/* Spinner */}
                <motion.div
                  className="border-2 border-white border-t-transparent rounded-full w-5 h-5 mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
                {/* "Sending..." Text */}
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </button>
          <p className="text-center text-gray-400 mt-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300">← Back to Home</Link>
          </p>
        </form>

        {/* Toast Container */}
        <ToastContainer
          position="top-right" // Set position to top-right
          autoClose={5000} // Automatically close the toast after 5 seconds
          hideProgressBar={false} // Show progress bar
          newestOnTop={false} // Show the newest toast on the top
          closeOnClick
          rtl={false} // For right-to-left languages, you can set this to true
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
}
