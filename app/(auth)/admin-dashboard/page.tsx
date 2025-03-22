'use client';

import Link from 'next/link';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load

    // Redirect to login if not authenticated
    if (!session) {
      router.push('/login');
      return;
    }

    // Redirect to home if authenticated but not an admin
    if (session.user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  // If loading or not authenticated, don't render content
  if (status === 'loading' || !session) {
    return <div className="min-h-screen bg-gradient-to-r from-blue-900 via-blue-800 to-blue-500 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>;
  }

  // Only render admin content if user is authenticated and is an admin
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
            <Link href="/admin-dashboard/blogList" className="bg-blue-600 text-white py-2 px-4 rounded-md text-xl hover:bg-blue-700 transition">
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
