import Link from 'next/link';
import React from 'react';

function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-blue-800 to-blue-500 p-6 flex flex-col items-center justify-center">
      <div className="text-center text-white space-y-6 animate__animated animate__fadeIn">
        {/* Animated Welcome Header */}
        <h1 className="text-4xl font-extrabold tracking-wide animate__animated animate__fadeIn animate__delay-1s">
          🎉 Welcome, Admin! 🎉
        </h1>

        {/* Description */}
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto animate__animated animate__fadeIn animate__delay-2s">
          <h2 className="text-3xl font-semibold text-gray-800">
            You're in Control
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Manage your dashboard, monitor statistics, and oversee the platform. The admin panel gives you complete control over everything.
          </p>

          {/* Admin Panel Action Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Link href="/admin-dashboard/blogs" className="bg-blue-600 text-white py-2 px-4 rounded-md text-xl hover:bg-blue-700 transition">
            Manage Blogs
            </Link>
            <Link href="/admin-dashboard/users" className="bg-green-600 text-white py-2 px-4 rounded-md text-xl hover:bg-green-700 transition">
              Manage Users
            </Link>
          </div>

          {/* Admin Stats */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Total Active Users: 1,254</p>
            <p>Total Reports Pending: 4</p>
            <p>System Health: Excellent</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
