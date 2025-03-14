"use client";

import dynamic from "next/dynamic";

// `SignupForm` ko dynamically import kar rahe hain, SSR disable kar diya
const SignupForm = dynamic(() => import("@/app/component/SignupForm"), { ssr: false });

export default function SignupPage() {
  return <SignupForm />;
}
