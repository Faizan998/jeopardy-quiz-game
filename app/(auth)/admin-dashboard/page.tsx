<<<<<<< HEAD
"use client";
import { motion } from 'framer-motion';
import { signOut } from 'next-auth/react'; 
import { useRouter } from 'next/navigation'; // Import signOut from next-auth/react

const AdminDashboard = () => {
  const router = useRouter();

  const handleLogout = async () => {
    // Sign the user out and redirect to the login page
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 shadow-lg">
      {/* Your existing admin dashboard code here */}

      {/* Logout button */}
      <motion.button
        onClick={handleLogout} // Trigger logout
        className="text-white hover:text-red-200 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-red-500"
      >
        Logout
      </motion.button>
    </nav>
  );
};

export default AdminDashboard;
=======
import React from 'react'
import Blog from "@/app/(auth)/admin-dashboard/components/Blog"
function page() {
  return (
  <>
  <Blog/>
  </>
  )
}

export default page
>>>>>>> 2e8e39ec365a9e42612c4ae7cf8ecb7a958c8be0
