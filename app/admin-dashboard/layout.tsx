'use client';

import { useSession } from 'next-auth/react';
import AdminNavigation from '@/components/AdminNavigation';
export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === 'loading') return null; // Wait for session to load

  return (
    <div>
      {session?.user && <AdminNavigation />} {/* Show Navigation only if user is logged in */}
      <main>{children}</main>
    </div>
  );
}
