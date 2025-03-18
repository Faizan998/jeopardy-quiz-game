"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
    } else if (session.user.role === "ADMIN") {
      router.push("/admin-dashboard");
    } else {
      router.push("/user-dashboard");
    }
  }, [session, status, router]);

  return <p className="text-center text-white text-xl">Redirecting...</p>;
}







