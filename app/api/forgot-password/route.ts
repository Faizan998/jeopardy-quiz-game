import { NextResponse } from "next/server";
import prisma from "../../lib/prisma"; // Ensure Prisma is correctly set up
import crypto from "crypto";
import * as Brevo from "@getbrevo/brevo"; // Use * as Brevo to import all exports

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1-hour expiration

    // Store token in the database
    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    // ✅ Fix: Initialize Brevo API correctly
    const apiInstance = new Brevo.TransactionalEmailsApi(); // Direct instantiation
    apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey, // Use the correct enum for the API key type
      process.env.BREVO_API_KEY! // Set API key from environment variable
    );

    // Email details
    const resetLink = `${process.env.NEXTAUTH_URL}/update-password?token=${resetToken}`;
    const emailContent = {
      sender: { email: process.env.BREVO_SENDER_EMAIL!, name: process.env.BREVO_SENDER_NAME! },
      to: [{ email }],
      subject: "Password Reset Request",
      htmlContent: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="color: blue;">Reset Password</a>
        <p>This link expires in 1 hour.</p>
      `,
    };

    // Send email
    await apiInstance.sendTransacEmail(emailContent);

    return NextResponse.json({ message: "Password reset link sent!" }, { status: 200 });
  } catch (error: any) {
    console.error("Brevo Error:", error);
    return NextResponse.json({ message: "Failed to send reset link." }, { status: 500 });
  }
}