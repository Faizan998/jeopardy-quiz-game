"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function Admindashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role"); // Assuming role is stored in localStorage

    if (!token || userRole === "admin") {
     // Redirect if not logged in or not an admin
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-gray-700">Welcome to the admin dashboard.</p>
      </div>
    </div>
  );
}

export default Admindashboard;
