import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "reCAPTCHA token is required" },
        { status: 400 }
      );
    }

    const secretKey = process.env.NEXT_PUBLIC_RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error("NEXT_PUBLIC_RECAPTCHA_SECRET_KEY is not configured");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    const verificationResponse = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: secretKey,
          response: token,
        },
      }
    );

    if (verificationResponse.data.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: "reCAPTCHA verification failed",
          errors: verificationResponse.data["error-codes"]
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("reCAPTCHA verification error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Error verifying reCAPTCHA",
        error: error.message 
      },
      { status: 500 }
    );
  }
} 