import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";
import { readContentFile, writeContentFile, listContentFiles } from "@/lib/github-storage";

export async function GET() {
  try {
    const dates = await listContentFiles();
    const issues: { date: string; published: boolean; published_at: string | null }[] = [];

    for (const date of dates) {
      const raw = await readContentFile(date);
      if (!raw) continue;
      const { data } = matter(raw);
      issues.push({
        date,
        published: data.published !== false,
        published_at: data.published_at || null,
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