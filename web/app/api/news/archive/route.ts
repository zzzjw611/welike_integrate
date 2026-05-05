import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { listIssues } from "@/lib/ai-marketer-news";

export const dynamic = "force-static";

export async function GET() {
  try {
    const all = await listIssues();
    const issues: { date: string; published: boolean }[] = [];

    for (const date of all) {
      const filePath = path.join(process.cwd(), "content", `${date}.md`);
      try {
        const raw = await fs.readFile(filePath, "utf8");
        const { data } = matter(raw);
        issues.push({
          date,
          published: data.published !== false,
        });
      } catch {
        issues.push({ date, published: false });
      }
    }

    return NextResponse.json({ issues });
  } catch (e) {
    return NextResponse.json({ issues: [], error: String(e) }, { status: 500 });
  }
}
