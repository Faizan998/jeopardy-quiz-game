import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";
import crypto from "crypto";
import * as Brevo from "@getbrevo/brevo";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.authentications.apiKey.apiKey = process.env.BREVO_API_KEY!;

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

    const response = await apiInstance.sendTransacEmail(emailContent);
    console.log("Brevo Response:", response); // Log the response

    return NextResponse.json({ message: "Password reset link sent!" }, { status: 200 });
  } catch (error: any) {
    console.error("Brevo Error:", error);
    return NextResponse.json({ message: "Failed to send reset link." }, { status: 500 });
  }
}