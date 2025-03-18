"use client"; // Ensure full client-side rendering

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid"; // Eye icons for password visibility
import { updatePasswordSchema } from "../../utils/validationSchemas";
import { ZodError } from "zod";

export default function UpdatePassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Ensure token is always a string to avoid hydration issues
  const [token, setToken] = useState<string | null>(null);
  const [clientReady, setClientReady] = useState(false); // Prevent hydration mismatch
  
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  // ✅ Fix: Ensure token is only set after client mounts
  useEffect(() => {
    setToken(searchParams?.get("token") ?? "");
    setClientReady(true);
  }, [searchParams]);

  // ✅ Fix: Ensure no SSR-dependent rendering
  if (!clientReady) return null;

  const validatePassword = () => {
    try {
      updatePasswordSchema.parse({ token: token || "", newPassword });
      setValidationError("");
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const passwordError = error.errors.find(err => err.path.includes('newPassword'));
        setValidationError(passwordError?.message || "Invalid password");
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      const { data } = await axios.post("/api/update-password", { token, newPassword });
      setMessage(data.message);
      
      if (data.message.includes("success")) {
        setTimeout(() => router.push("/login"), 1500);
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-500 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <h2 className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse drop-shadow-lg">
        Update Password
      </h2>

      <div className="bg-gray-800 bg-opacity-80 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6 border border-gray-700">
        {token ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-gray-300 text-lg text-center">Reset your password</p>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (validationError) setValidationError("");
                }}
                placeholder="Enter new password"
                required
                disabled={isLoading}
                className={`w-full p-3 bg-gray-900 text-gray-200 border ${validationError ? 'border-red-500' : 'border-gray-600'} rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200 transition-colors duration-200"
                disabled={isLoading}
              >
                {showPassword ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
              </button>
            </div>

            {validationError && <p className="text-sm text-red-500">{validationError}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-md hover:shadow-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed hover:scale-105 relative overflow-hidden"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        ) : (
          <p className="text-red-500 text-center">
            No token provided. Please use the reset link sent to your email.
          </p>
        )}

        {message && (
          <p className={`text-center font-semibold ${message.includes("success") ? "text-blue-400" : "text-red-500"} transition-opacity duration-300`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
