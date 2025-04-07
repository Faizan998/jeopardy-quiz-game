'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function AdminNavigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/admin-dashboard" className="text-xl font-bold text-white">
              Hello! Sayyad Faizan Ali
            </Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <div className="relative group">
              <Link
                href="/admin-dashboard/createBlog"
                className={`text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  pathname === '/admin-dashboard/createBlog' ? 'bg-blue-700' : ''
                }`}
              >
                Manage Blogs
              </Link>
              <div className="absolute left-0 mt-1 w-48 rounded-lg shadow-lg bg-white z-10 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
                <Link
                  href="/admin-dashboard/createBlog"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-t-lg"
                >
                  Create Blog
                </Link>
                <Link
                  href="/admin-dashboard/createCategory"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                >
                  Create Category
                </Link>
                <Link
                  href="/admin-dashboard/blogList"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-b-lg"
                >
                  Blog List
                </Link>
              </div>
            </div>

            <Link
              href="/admin-dashboard/questions"
              className={`text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                pathname === '/admin-dashboard/questions' ? 'bg-blue-700' : ''
              }`}
            >
              Manage Questions
            </Link>
            <Link
              href="/admin-dashboard/users"
              className={`text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                pathname === '/admin-dashboard/users' ? 'bg-blue-700' : ''
              }`}
            >
              Manage Users
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="ml-4 px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-blue-700">
              <div className="space-y-1">
                <Link
                  href="/admin-dashboard/createBlog"
                  className={`block px-3 py-2 rounded-md text-white hover:bg-blue-600 text-sm font-medium ${
                    pathname === '/admin-dashboard/createBlog' ? 'bg-blue-800' : ''
                  }`}
                >
                  Manage Blogs
                </Link>
                <div className="pl-4 space-y-1">
                  <Link
                    href="/admin-dashboard/createBlog"
                    className="block px-3 py-2 text-sm text-blue-100 hover:bg-blue-600 hover:text-white rounded-md"
                  >
                    Create Blog
                  </Link>
                  <Link
                    href="/admin-dashboard/createCategory"
                    className="block px-3 py-2 text-sm text-blue-100 hover:bg-blue-600 hover:text-white rounded-md"
                  >
                    Create Category
                  </Link>
                  <Link
                    href="/admin-dashboard/blogList"
                    className="block px-3 py-2 text-sm text-blue-100 hover:bg-blue-600 hover:text-white rounded-md"
                  >
                    Blog List
                  </Link>
                </div>
              </div>

              <Link
                href="/admin-dashboard/questions"
                className={`block px-3 py-2 rounded-md text-white hover:bg-blue-600 text-sm font-medium ${
                  pathname === '/admin-dashboard/questions' ? 'bg-blue-800' : ''
                }`}
              >
                Manage Questions
              </Link>
              <Link
                href="/admin-dashboard/users"
                className={`block px-3 py-2 rounded-md text-white hover:bg-blue-600 text-sm font-medium ${
                  pathname === '/admin-dashboard/users' ? 'bg-blue-800' : ''
                }`}
              >
                Manage Users
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full text-left px-3 py-2 rounded-md text-white bg-blue-800 hover:bg-blue-900 text-sm font-medium cursor-pointer"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}