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

    const resetLink = `${process.env.NEXTAUTH_URL}/?token=${resetToken}`;
    const emailContent = {
      sender: { email: process.env.BREVO_SENDER_EMAIL!, name: process.env.BREVO_SENDER_NAME! },
      to: [{ email }],
      subject: "Password Reset Request",
      htmlContent: `
  <html>
  <head>
    <meta charset="UTF-8">
    <title>🔑 Reset Your Password</title>
    <style>
      body {
        font-family: 'Arial', sans-serif;
        background-color: #f9f9f9;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 520px;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.15);
        text-align: center;
        margin: 40px auto;
        border-top: 6px solid #007bff;
      }
      h2 {
        color: #222;
        font-size: 26px;
        margin-bottom: 12px;
      }
      p {
        color: #555;
        font-size: 16px;
        line-height: 1.7;
      }
      .button {
        display: inline-block;
        background: linear-gradient(135deg, #007bff, #00d4ff);
        color: #ffffff;
        padding: 14px 30px;
        font-size: 18px;
        font-weight: bold;
        text-decoration: none;
        border-radius: 8px;
        box-shadow: 0px 0px 15px rgba(0, 212, 255, 0.7);
        transition: all 0.3s ease-in-out;
        position: relative;
        overflow: hidden;
      }
      .button::before {
        content: "";
        position: absolute;
        top: -100%;
        left: -100%;
        width: 300%;
        height: 300%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 10%, rgba(0, 0, 0, 0) 70%);
        transition: all 0.5s ease-in-out;
      }
      .button:hover::before {
        top: 0;
        left: 0;
      }
      .button:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0px 0px 25px rgba(0, 212, 255, 1);
      }
      .footer {
        font-size: 13px;
        color: #777;
        margin-top: 25px;
        border-top: 1px solid #ddd;
        padding-top: 15px;
      }
      .footer a {
        color: #007bff;
        text-decoration: none;
        font-weight: bold;
      }
      .logo {
        width: 120px;
        margin-bottom: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>🔒 Secure Password Reset</h2>
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>
        We noticed that you requested a password reset. No worries! Just click the button below to reset your password securely.
      </p>
      <a href="${resetLink}" class="button">🔗 Reset My Password</a>
      <p>This link will expire in <strong>60 minutes</strong>.</p>
      <p>If you didn’t make this request, you can safely ignore this email.</p>
      <div class="footer">
        <p>Need help? <a href="mailto:support@jeopardy.com">Contact Support</a></p>
        <p>&copy; 2025 Jeopardy Team. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`
,
    };

    const response = await apiInstance.sendTransacEmail(emailContent);
    console.log("Brevo Response:", response); // Log the response

    return NextResponse.json({ message: "Password reset link sent!" }, { status: 200 });
  } catch (error: any) {
    console.error("Brevo Error:", error);
    return NextResponse.json({ message: "Failed to send reset link." }, { status: 500 });
  }
}