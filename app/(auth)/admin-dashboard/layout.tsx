"use client"; // Add this directive since we're using client-side features

import React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react"; // Import signOut
import { ReactNode } from "react";

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const handleLogout = () => {
    signOut({ callbackUrl: "/login" }); // Redirect to /login after logout
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 p-4 text-white">
        <ul className="flex space-x-4">
          <li>
            <Link href="/admin-dashboard/update-blog">Update Blog</Link>
          </li>
          <li>
            <Link href="/admin-dashboard/users">Users</Link>
          </li>
          <li>
            <Link href="/admin-dashboard/check-user-score">Check User Score</Link>
          </li>
          <li>
            <Link href="/admin-dashboard/update-question-answer">Update Question/Answer</Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="text-white hover:underline focus:outline-none"
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
      <main className="p-8">{children}</main>
    </div>
  );
};

export default AdminLayout;