import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, html" },
        { status: 400 }
      );
    }

    // Use Resend if API key is configured
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "AI Marketer News <news@ai-marketer-news.vercel.app>",
          to: [to],
          subject,
          html,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Resend API error");
      }

      return NextResponse.json({ success: true, id: data.id });
    }

    // Fallback: use SMTP via nodemailer if configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      // Dynamic import nodemailer (it's a large dependency)
      let nodemailer: any;
      try {
        nodemailer = await import("nodemailer" as string);
      } catch {
        return NextResponse.json(
          { error: "SMTP is configured but nodemailer is not installed" },
          { status: 500 }
        );
      }

      const transporter = nodemailer.default.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort || "587"),
        secure: smtpPort === "465",
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: smtpUser,
        to,
        subject,
        html,
      });

      return NextResponse.json({ success: true });
    }

    // No email provider configured
    return NextResponse.json(
      {
        error:
          "No email provider configured. Set RESEND_API_KEY or SMTP_* environment variables.",
      },
      { status: 500 }
    );
  } catch (err: any) {
    console.error("send-email error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
