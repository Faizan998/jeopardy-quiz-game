"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold text-blue-400">
        Jeopardy
      </Link>
      <div className="flex space-x-4">
        {session ? (
          <>
            <button onClick={() => signOut()} className="px-4 py-2 bg-red-600 rounded-lg">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="px-4 py-2 bg-blue-500 rounded-lg">Login</Link>
            <Link href="/signup" className="px-4 py-2 bg-green-500 rounded-lg">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
