import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Missing token" },
        { status: 400 }
      );
    }

    const secretKey =
      process.env.TURNSTILE_SECRET_KEY ||
      "1x0000000000000000000000000000000AA";

    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);

    const result = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    );

    const outcome = await result.json();

    if (outcome.success) {
      return NextResponse.json({ valid: true });
    } else {
      console.warn("Turnstile verification failed:", outcome["error-codes"]);
      return NextResponse.json(
        { valid: false, error: outcome["error-codes"] },
        { status: 403 }
      );
    }
  } catch (err) {
    console.error("Turnstile verify error:", err);
    return NextResponse.json(
      { valid: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
