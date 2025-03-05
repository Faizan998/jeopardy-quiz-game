"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { logoutUser } from "../../redux/feature/userSlice";

export default function UserDashboard() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login"); // Redirect if not logged in
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    dispatch(logoutUser()); // Redux se user hatao
    router.push("/login"); // Redirect to login
  };

  if (loading) {
    return <p className="text-center text-white text-xl">Loading...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold text-blue-500 mb-4">Welcome to User Dashboard</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
        <p className="text-xl font-semibold">Hello, {user.name}!</p>
        <p className="text-lg text-gray-300">Email: {user.email}</p>

        <button
          onClick={handleLogout}
          className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition duration-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
