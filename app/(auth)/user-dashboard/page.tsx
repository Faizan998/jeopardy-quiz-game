"use client";

import React from "react";
import Link from "next/link";

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-gray-800 p-4 shadow-lg">
        <h1 className="text-xl font-bold">Jeopardy Game</h1>
        <Link href="/user-dashboard/jeopardy">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Play Jeopardy
          </button>
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center h-[80vh]">
        <h2 className="text-2xl">Welcome to the User Dashboard!</h2>
      </div>
    </div>
  );
}
