"use client";

import dynamic from "next/dynamic";

// `SignupForm` ko dynamically import kar rahe hain, SSR disable kar diya
<<<<<<< HEAD
const SignupForm = dynamic(() => import("@/app/components/signupForm"), { ssr: false });

export default function SignupPage() {
  return <SignupForm />;
}
=======
const SignupForm = dynamic(() => import("@/app/component/SignupForm"), { ssr: false });

export default function SignupPage() {
  return <SignupForm />;
}
>>>>>>> 2e8e39ec365a9e42612c4ae7cf8ecb7a958c8be0
