'use client';

import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === 'loading') return null; // Wait for session to load

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Show Navigation only if user is logged in */}
      {session?.user && <Navigation />}

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-6 lg:p-8">{children}</main>

      {/* Footer */}
      <footer className=" bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-center py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-lg font-semibold">Jeopardy Quiz</h2>
          <p className="text-sm mt-1">Challenge your knowledge and have fun!</p>
          <hr className="border-blue-500 my-4 w-1/2 mx-auto opacity-50" />
          <p className="text-sm">&copy; {new Date().getFullYear()} Jeopardy Quiz. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
