import { NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";

/**
 * Proxy endpoint to read a news content file from GitHub.
 * Uses GITHUB_TOKEN for authentication (5000 req/hr) instead of unauthenticated (60 req/hr).
 *
 * GET /api/news/content?date=2026-05-06&branch=master
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const branch = searchParams.get("branch") || "master";

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const res = await fetch(
      `https://api.github.com/repos/zzzjw611/welike_integrate/contents/web/content/${date}.md?ref=${branch}`,
      {
        headers: {
          ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (res.status === 404) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `GitHub API error: ${err}` }, { status: 502 });
    }

    const data = await res.json();
    // Fetch raw content to avoid base64 encoding issues
    const rawRes = await fetch(data.download_url);
    const raw = await rawRes.text();

    return NextResponse.json({ content: raw, sha: data.sha });
  } catch (err) {
    console.error("Error reading content:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to read content" },
      { status: 500 }
    );
  }
}
