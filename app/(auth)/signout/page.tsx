"use client";
import { signOut } from 'next-auth/react';  // Import signOut from next-auth

const handleLogout = async () => {
  // Clear the session and redirect to login page
  await signOut({ callbackUrl: '/login' });  // Ensures user is redirected to login page
};
