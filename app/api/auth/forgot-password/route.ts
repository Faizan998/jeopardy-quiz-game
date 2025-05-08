import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Ensure Prisma is correctly set up
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
        <html>
  <head>
    <style>
      /* General body styles */
      body {
        font-family: 'Arial', sans-serif;
        background-color: #f4f7fc;
        margin: 0;
        padding: 0;
        text-align: center;
      }

      /* Container for the email content */
      .email-container {
        background-color: #ffffff;
        width: 100%;
        max-width: 600px;
        margin: 50px auto;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }

      /* Title styling */
      h2 {
        font-size: 24px;
        color: #1d72b8; /* Blue color */
        margin-bottom: 20px;
        font-weight: 600;
      }

      /* Paragraph styling */
      p {
        font-size: 16px;
        color: #333;
        line-height: 1.5;
        margin-bottom: 20px;
      }

      /* Link (button) styling */
      a {
        text-decoration: none;
        font-size: 18px;
        color: #ffffff; /* White text */
        font-weight: bold;
        border: 2px solid #1d72b8; /* Blue border */
        padding: 12px 30px;
        border-radius: 6px;
        background-color: #black; /* Dark Blue background */
        transition: background-color 0.3s ease, color 0.3s ease;
        display: inline-block;
        margin-top: 15px;
      }

      /* Hover effect for button */
      a:hover {
        background-color: black; /* Light blue background on hover */
        color: white; /* White text on hover */
      }

      /* Expiry notice */
      .expiry {
        font-size: 14px;
        color: #f44336; /* Red for expiry notice */
        margin-top: 15px;
      }

      /* Footer with social links or additional info */
      .footer {
        font-size: 14px;
        color: #555;
        margin-top: 30px;
      }

      /* Link styling for footer */
      .footer a {
        color: #1d72b8; /* Blue color */
        text-decoration: none;
      }

      /* Hover effect for footer links */
      .footer a:hover {
        background-color: black;
        color: white; /* Light blue on hover */
      }

      /* Icons styling */
      .icon {
        width: 24px;
        height: 24px;
        margin-right: 8px;
        vertical-align: middle;
      }

      /* Container for icon and text */
      .icon-text {
        display: inline-flex;
        align-items: center;
      }

      /* Styling for icon-container */
      .icon-container {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <h2>Password Reset</h2>
      <p>
        <span class="icon-text">
          <img src="https://img.icons8.com/ios-filled/50/000000/lock.png" alt="lock icon" class="icon" />
          Hi,
        </span>
      </p>
      <p>
        <span class="icon-text">
          <img src="https://img.icons8.com/ios-filled/50/000000/link.png" alt="link icon" class="icon" />
          Click the Button below to reset your password:
        </span>
      </p>
      <a href="${resetLink}">Reset Password</a>
      <p class="expiry">
        <span class="icon-text">
          <img src="https://img.icons8.com/ios-filled/50/000000/alarm.png" alt="alarm icon" class="icon" />
          This link expires in 1 hour.
        </span>
      </p>
      <p>
        <span class="icon-text">
          If you didn't request a password reset, please ignore this email.
        </span>
      </p>

      <div class="footer">
        <p>
          <span class="icon-text">
            For any issues, contact us at <a href="mailto:alifaizan15245@gmail.com">support@gmail.com</a>
          </span>
        </p>
      </div>
    </div>
  </body>
</html>

      `,
    };

    // Send email
    await apiInstance.sendTransacEmail(emailContent);

    return NextResponse.json({ message: "Password reset link sent!" }, { status: 200 });
  } catch (error) {
    console.error("Brevo Error:", error);
    return NextResponse.json({ message: "Failed to send reset link." }, { status: 500 });
  }
}