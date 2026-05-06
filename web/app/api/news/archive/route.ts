import { NextResponse } from "next/server";
import { listContentFiles, readContentFile } from "@/lib/github-storage";
import matter from "gray-matter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const all = await listContentFiles();
    const issues: { date: string; published: boolean }[] = [];

    for (const date of all) {
      try {
        const raw = await readContentFile(date);
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