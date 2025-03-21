"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Edit, Trash2 } from "lucide-react"; // Importing Lucide Icons

// Define types for user data
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null); // Add error state
  const { data: session, status } = useSession(); // Using session from next-auth
  const router = useRouter();

  // Fetch all users from the API
  const fetchUsers = async () => {
    try {
      if (status === "loading") return; // Wait for session to load
      if (!session || session.user.role !== "ADMIN") {
        setError("You are not authorized to view users.");
        return;
      }

      // Make the request to fetch all users (you should ideally fetch all users including admins)
      const response = await axios.get("/api/admin/user", {});

      if (response.data.users) {
        // Filter out users with the role 'ADMIN'
        const nonAdminUsers = response.data.users.filter(
          (user: User) => user.role !== "ADMIN"
        );
        setUsers(nonAdminUsers); // Only set non-admin users
      } else {
        setError("No users found.");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load users.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [session]); // Refetch when the session changes

  // Handle delete user
  const handleDeleteUser = async (email: string) => {
    try {
      if (!session || session.user.role !== "ADMIN") {
        setError("You are not authorized to delete users.");
        return;
      }

      const response = await axios.delete("/api/admin/user", {
        data: { email }, // Send the email to delete the user
      });
          console.log(response);
      if (response.data.message === "User deleted successfully") {
        alert("User deleted successfully");
        setUsers(users.filter(user => user.email !== email)); // Remove deleted user from state
      } else {
        alert("Failed to delete user.");
        
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-blue-900 to-blue-600 dark:bg-blue-500 text-white transition-all duration-300 ease-in-out">
      {/* Users Table */}
      <div className="p-4 sm:p-6 lg:p-8 xl:p-10 rounded-lg border-2 border-white/40 shadow-lg shadow-white bg-opacity-70 overflow-auto">
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center transition-all duration-300 ease-in-out">
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Role</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-red-600 font-semibold">
                  {error}
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((user, index) => (
                <tr
                  key={user.id}
                  className="border-b text-white bg-blue-400/50 hover:bg-blue-500/70 transition-all duration-300 ease-in-out transform hover:scale-z-105"
                >
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">{user.role}</td>
                  <td className="py-3 px-4 flex justify-start gap-4">
                    
                    {/* Delete Icon (Lucide Trash Icon) */}
                    <button
                      onClick={() => handleDeleteUser(user.email)}
                      className=" cursor-pointer text-red-600 hover:text-red-800 transform transition-all duration-300 ease-in-out hover:scale-110"
                    >
                      <Trash2 size={20} /> {/* Lucide Trash Icon */}Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-red-700">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
