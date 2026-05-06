import { NextResponse } from "next/server";
import { listContentFiles, readContentFile } from "@/lib/github-storage";
import matter from "gray-matter";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // In local dev, read from local filesystem (no GITHUB_TOKEN needed)
    // In production (Vercel), read from GitHub API
    const isLocal = !process.env.VERCEL;
    let all: string[];

    if (isLocal) {
      const contentDir = path.join(process.cwd(), "content");
      try {
        const files = await fs.readdir(contentDir);
        all = files
          .filter((f) => f.endsWith(".md"))
          .map((f) => f.replace(/\.md$/, ""))
          .sort((a, b) => b.localeCompare(a));
      } catch {
        all = [];
      }
    } else {
      all = await listContentFiles();
    }

    const issues: { date: string; published: boolean }[] = [];

    for (const date of all) {
      try {
        let raw: string | null;
        if (isLocal) {
          const filePath = path.join(process.cwd(), "content", `${date}.md`);
          try {
            raw = await fs.readFile(filePath, "utf8");
          } catch {
            raw = null;
          }
        } else {
          raw = await readContentFile(date);
        }

        if (raw) {
          const { data } = matter(raw);
          issues.push({
            date,
            published: data.published !== false,
          });
        } else {
          issues.push({ date, published: false });
        }
      } catch {
        issues.push({ date, published: false });
      }
    }

    return NextResponse.json({ issues });
  } catch (e) {
    return NextResponse.json({ issues: [], error: String(e) }, { status: 500 });
  }
}
