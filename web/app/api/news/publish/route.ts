import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export async function GET() {
  try {
    const contentDir = path.join(process.cwd(), "content");
    const files = await fs.readdir(contentDir);
    const issues: { date: string; published: boolean }[] = [];

    for (const file of files.sort().reverse()) {
      if (!file.endsWith(".md")) continue;
      const date = file.replace(/\.md$/, "");
      const raw = await fs.readFile(path.join(contentDir, file), "utf8");
      const { data } = matter(raw);
      issues.push({
        date,
        published: data.published !== false,
      });
    }

    return NextResponse.json({ data: issues });
  } catch (e) {
    return NextResponse.json({ data: [], error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { date, published } = await req.json();
    if (!date) {
      return NextResponse.json({ error: "Missing date" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "content", `${date}.md`);
    let raw: string;
    try {
      raw = await fs.readFile(filePath, "utf8");
    } catch {
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
    await fs.writeFile(filePath, newRaw, "utf8");

    return NextResponse.json({ success: true, date, published });
  } catch (e) {
    return NextResponse.json(
      { error: String(e) },
      { status: 500 }
    );
  }
}