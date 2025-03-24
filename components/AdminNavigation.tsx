'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/admin-dashboard" className="text-xl font-bold text-blue-600">
                Hello! Sayyad Faizan Ali
              </Link>
            </div>
            {/* Centered Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 mx-auto">
              <div className="relative group">
                <Link
                  href="/admin-dashboard/createBlog"
                  className={`inline-flex items-center px-1 pt-6 border-b-2 text-sm font-medium ${
                    pathname === '/admin-dashboard/createBlog'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Manage Blogs
                </Link>
                {/* Dropdown */}
                <div className="absolute left-0 hidden group-hover:block py-4 mt-2 w-48 bg-white shadow-lg rounded-md z-10">
                  <Link
                    href="/admin-dashboard/createBlog"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Create Blog
                  </Link>
                  <Link
                    href="/admin-dashboard/createCategory"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Create Category
                  </Link>
                  <Link
                    href="/admin-dashboard/blogList"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Blog List
                  </Link>
                </div>
              </div>
              <div className="relative group">
                <Link
                  href="/admin-dashboard/createProduct"
                  className={`inline-flex items-center px-1 pt-6 border-b-2 text-sm font-medium ${
                    pathname === '/admin-dashboard/createProduct'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Manage Store
                </Link>
                {/* Dropdown */}
                <div className="absolute left-0 hidden group-hover:block py-4 mt-2 w-48 bg-white shadow-lg rounded-md z-10">
                  <Link
                    href="/admin-dashboard/createProduct"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Create Product
                  </Link>
                  <Link
                    href="/admin-dashboard/createProductCategory"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Create ProductCategory
                  </Link>
                  <Link
                    href="/admin-dashboard/productList"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                   Product List
                  </Link>
                </div>
              </div>

              <Link
                href="/admin-dashboard/question-answer-update"
                className={`inline-flex items-center px-1 pt-2 border-b-2 text-sm font-medium ${
                  pathname.includes('/admin-dashboard/question-answer-update')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Q&A Management
              </Link>
              <Link
                href="/admin-dashboard/users"
                className={`inline-flex items-center px-1 pt-2 border-b-2 text-sm font-medium ${
                  pathname === '/admin-dashboard/users'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Manage Users
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="inline-flex cursor-pointer items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
