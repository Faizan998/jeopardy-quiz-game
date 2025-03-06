"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/feature/userSlice";
import { useSession, signOut } from "next-auth/react";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return; // Jab tak session load ho raha hai, kuch mat karo

    if (status === "unauthenticated") {
      router.push("/signup"); // Agar user logout ho chuka hai, signup page bhejo
    } else if (!session || session.user?.role !== "ADMIN") {
      router.push("/login"); // Non-admin ko login page pe bhejo
    } else {
      setLoading(false); // Admin hai to loading hata do
    }
  }, [session, status, router]);

  const handleLogout = async () => {
    dispatch(logoutUser()); // Redux ka user state clear karo
    await signOut({ redirect: false }); // NextAuth se session clear karo (redirect false rakho)
    router.push("/signup"); // Phir manually signup page pe le jao
  };

  if (loading) {
    return <p className="text-center text-white text-xl">Loading...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold text-red-500">Admin Dashboard</h1>
      <p className="text-lg">Welcome, Admin!</p>

      {/* Admin Details */}
      {session?.user && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-4 w-full max-w-md">
          <p className="text-xl font-semibold text-blue-400">
            Name: {session.user.name || "Not Available"}
          </p>
          <p className="text-lg text-gray-300">
            Email: {session.user.email || "Not Available"}
          </p>
          <p className="text-lg text-gray-300">
            Role: {session.user.role || "Not Available"}
          </p>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg"
      >
        Logout
      </button>
    </div>
  );
}
