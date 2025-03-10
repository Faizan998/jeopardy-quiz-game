import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "All fields (name, email, message) are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.BERVO_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;
    const senderEmail = process.env.BERVO_EMAIL_SENDER;
    const senderName = process.env.BERVO_NAME_SENDER;

    // Debug log to check env vars
    console.log("Loaded environment variables:", {
        BERVO_API_KEY: apiKey ? "Present" : "Missing",
        ADMIN_EMAIL: adminEmail ? "Present" : "Missing",
        BERVO_EMAIL_SENDER: senderEmail ? "Present" : "Missing",
        BERVO_NAME_SENDER: senderName ? "Present" : "Missing",
    });

    if (!apiKey || !adminEmail || !senderEmail || !senderName) {
      console.error("Missing environment variables:", {
        hasApiKey: !!apiKey,
        hasAdminEmail: !!adminEmail,
        hasSenderEmail: !!senderEmail,
        hasSenderName: !!senderName,
      });
      return NextResponse.json(
        {
          message:
            "Server configuration error: Missing Brevo API key, admin email, sender email, or sender name",
        },
        { status: 500 }
      );
    }

    const adminEmailData = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: adminEmail }],
      subject: "New Contact Form Submission",
      htmlContent: `
        <html>
          <body>
            <h1>New Contact Form Submission</h1>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong> ${message}</p>
          </body>
        </html>
      `,
    };

    const userEmailData = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email }],
      subject: "Thank You for Contacting Us!",
      htmlContent: `
        <html>
          <body>
            <h1>Thank You, ${name}!</h1>
            <p>We’ve received your message:</p>
            <p><strong>Your Message:</strong> ${message}</p>
            <p>Our team will get back to you soon.</p>
            <p>Best regards,<br/>${senderName} Team</p>
          </body>
        </html>
      `,
    };

    const axiosConfig = {
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 10000,
    };

    const [adminResponse, userResponse] = await Promise.all([
      axios.post("https://api.brevo.com/v3/smtp/email", adminEmailData, axiosConfig),
      axios.post("https://api.brevo.com/v3/smtp/email", userEmailData, axiosConfig),
    ]);

    if (
      adminResponse.status >= 200 &&
      adminResponse.status < 300 &&
      userResponse.status >= 200 &&
      userResponse.status < 300
    ) {
      return NextResponse.json({ message: "Emails sent successfully" }, { status: 200 });
    } else {
      console.error("Unexpected response statuses:", {
        adminStatus: adminResponse.status,
        userStatus: userResponse.status,
      });
      return NextResponse.json(
        { message: "Failed to send one or both emails" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    if (error instanceof AxiosError) {
      console.error("Axios error in /api/contact:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });
      if (error.code === "ECONNABORTED") {
        return NextResponse.json(
          { message: "Request timed out. Please try again later." },
          { status: 504 }
        );
      }
      return NextResponse.json(
        {
          message: error.response?.data?.message || "Failed to send emails",
          details: error.message,
        },
        { status: error.response?.status || 500 }
      );
    }
    console.error("Unexpected error in /api/contact:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}