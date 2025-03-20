"use client";

import dynamic from "next/dynamic";


const SignupForm = dynamic(() => import("@/app/components/signupForm"), { ssr: false });

export default function SignupPage() {
  return <SignupForm />;
}