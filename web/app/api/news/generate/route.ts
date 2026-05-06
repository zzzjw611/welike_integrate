import { NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const OWNER = "zzzjw611";
const REPO = "welike_integrate";

export async function POST(request: Request) {
  try {
    const { date } = await request.json();
    const targetDate = date || new Date().toISOString().slice(0, 10);

    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        { error: "GITHUB_TOKEN is not configured" },
        { status: 500 }
      );
    }

    // Trigger GitHub Actions workflow_dispatch
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/generate-news.yml/dispatches`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: "master",
          inputs: {
            date: targetDate,
          },
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      // 204 means success (no content)
      if (res.status !== 204) {
        throw new Error("GitHub API error " + res.status + ": " + text);
      }
    }

    return NextResponse.json({
      success: true,
      date: targetDate,
      message: "Generation started. It will be ready in 1-2 minutes.",
    });
  } catch (err) {
    console.error("Error triggering generation:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to trigger generation" },
      { status: 500 }
    );
  }
}
