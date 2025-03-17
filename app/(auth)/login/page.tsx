"use client";

import dynamic from "next/dynamic";

// `SignupForm` ko dynamically import kar rahe hain, SSR disable kar diya
const LoginpForm = dynamic(() => import("@/app/components/loginForm"), { ssr: false });

export default function loginPage() {
  return <LoginpForm />;
}