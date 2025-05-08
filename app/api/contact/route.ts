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

    const apiKey = process.env.BREVO_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME;

    // Debug log to check env vars
    console.log("Loaded environment variables:", {
      BREVO_API_KEY: apiKey ? "Present" : "Missing",
      ADMIN_EMAIL: adminEmail ? "Present" : "Missing",
      BREVO_SENDER_EMAIL: senderEmail ? "Present" : "Missing",
      BREVO_SENDER_NAME: senderName ? "Present" : "Missing",
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
          message: "Server configuration error: Missing Brevo API key, admin email, sender email, or sender name",
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
        <head>
          <meta charset="UTF-8">
          <title>📩 New Contact Form Submission</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f8fc;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              background: #ffffff;
              padding: 35px;
              border-radius: 12px;
              box-shadow: 0px 8px 25px rgba(0, 0, 0, 0.15);
              margin: 40px auto;
              border-left: 6px solid #007bff;
              transition: all 0.3s ease-in-out;
              text-align: center;
            }
            .container:hover {
              transform: translateY(-5px);
              box-shadow: 0px 12px 30px rgba(0, 0, 0, 0.2);
            }
            h1 {
              color: #222;
              font-size: 26px;
              margin-bottom: 20px;
            }
            p {
              color: #555;
              font-size: 16px;
              line-height: 1.6;
              text-align: left;
            }
            .highlight {
              font-weight: bold;
              color: #007bff;
            }
            .message-box {
              background: #f1f8ff;
              padding: 15px;
              border-radius: 8px;
              font-style: italic;
              color: #333;
              box-shadow: inset 0px 0px 12px rgba(0, 0, 0, 0.1);
              border-left: 4px solid #007bff;
              margin: 15px 0;
            }
            .footer {
              font-size: 14px;
              color: #777;
              margin-top: 25px;
              border-top: 1px solid #ddd;
              padding-top: 12px;
              text-align: center;
            }
            .footer a {
              color: #007bff;
              text-decoration: none;
              font-weight: bold;
            }
            .footer a:hover {
              text-decoration: underline;
            }
            
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📬 New Contact Form Submission</h1>
            <p><span class="highlight">👤 Name:</span> ${name}</p>
            <p><span class="highlight">📧 Email:</span> ${email}</p>
            <p><span class="highlight">💬 Message:</span></p>
            <div class="message-box">
              <p>${message}</p>
            </div>
            <div style="text-align: center; margin-top: 25px;">
              <a href="mailto:${email}"</a>
            </div>
            <div class="footer">
              <p>Need help? <a href="mailto:alifaizan15245@gmail.com">Contact Support</a></p>
              <p>&copy; 2025 Jeopardy Quiz. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const userEmailData = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email }],
      subject: "Thank You for Contacting Us!",
      htmlContent: `
        <html>
        <head>
          <meta charset="UTF-8">
          <title>🙏 Thank You, ${name}!</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 550px;
              background: #ffffff;
              padding: 25px;
              border-radius: 12px;
              box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.15);
              text-align: center;
              margin: 40px auto;
              border-left: 6px solid #28a745;
            }
            h1 {
              color: #222;
              font-size: 24px;
              margin-bottom: 15px;
            }
            p {
              color: #555;
              font-size: 16px;
              line-height: 1.7;
              text-align: left;
            }
            .highlight {
              font-weight: bold;
              color: #28a745;
            }
            .message-box {
              background: #f9f9f9;
              padding: 15px;
              border-radius: 8px;
              font-style: italic;
              color: #333;
              box-shadow: inset 0px 0px 8px rgba(0, 0, 0, 0.05);
            }
            .footer {
              font-size: 13px;
              color: #777;
              margin-top: 20px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            .footer a {
              color: #28a745;
              text-decoration: none;
              font-weight: bold;
            }
            .logo {
              width: 100px;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🙏 Thank You, ${name}!</h1>
            <p>We've received your message:</p>
            <div class="message-box">
              <p><strong>Your Message:</strong> ${message}</p>
            </div>
            <p>Our team will get back to you as soon as possible.</p>
            <p>Best regards,</p>
            <p><strong>${senderName} Team</strong></p>
            <div class="footer">
              <p>Need further assistance? <a href="mailto:alifaizan15245@gmail.com">Contact Support</a></p>
              <p>&copy; 2025 ${senderName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const axiosConfig = {
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 50000,
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
  } catch (error) {
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
    return NextResponse.json(
      { message: "Internal server error", details: error },
      { status: 500 }
    );
  }
}