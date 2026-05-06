import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";
import { readContentFile, writeContentFile, listContentFiles } from "@/lib/github-storage";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const isLocal = !process.env.VERCEL;
    let dates: string[];

    if (isLocal) {
      const contentDir = path.join(process.cwd(), "content");
      try {
        const files = await fs.readdir(contentDir);
        dates = files
          .filter((f) => f.endsWith(".md"))
          .map((f) => f.replace(/\.md$/, ""))
          .sort((a, b) => b.localeCompare(a));
      } catch {
        dates = [];
      }
    } else {
      dates = await listContentFiles();
    }

    const issues: { date: string; published: boolean; published_at: string | null }[] = [];

    for (const date of dates) {
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
            published_at: data.published_at || null,
          });
        } else {
          issues.push({ date, published: false, published_at: null });
        }
      } catch {
        issues.push({ date, published: false, published_at: null });
      }
    }

    return NextResponse.json({ issues });
  } catch (e) {
    return NextResponse.json({ issues: [], error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { date, published } = await req.json();
    if (!date) {
      return NextResponse.json({ error: "Missing date" }, { status: 400 });
    }

    const raw = await readContentFile(date);
    if (!raw) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const { data, content } = matter(raw);
    data.published = published;
    if (published) {
      data.published_at = new Date().toISOString();
    } else {
      delete data.published_at;
    }

    const newRaw = matter.stringify(content, data);
    const action = published ? "publish" : "unpublish";
    await writeContentFile(date, newRaw, `chore: ${action} AI news for ${date}`);

    return NextResponse.json({ success: true, date, published });
  } catch (e) {
    return NextResponse.json(
      { error: String(e) },
      { status: 500 }
    );
  }
}