import { NextResponse } from "next/server";
import matter from "gray-matter";
import { readContentFile, writeContentFile } from "@/lib/github-storage";

export async function PUT(request: Request) {
  try {
    const { date, frontmatter, body } = await request.json();

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    // Read existing file to preserve published state
    const existing = await readContentFile(date);
    let existingPublished = false;
    if (existing) {
      const { data } = matter(existing);
      existingPublished = data.published === true;
    }

    // Build new frontmatter
    const mergedFrontmatter = {
      ...frontmatter,
      published: existingPublished, // preserve publish state
      date: date,
    };

    // Reconstruct the markdown file
    const newContent = matter.stringify(body || "", mergedFrontmatter);

    // Use [skip vercel] to avoid triggering a Vercel deployment for edits
    // (preview reads directly from GitHub API, no deploy needed)
    await writeContentFile(date, newContent, `chore: edit AI news for ${date} [skip vercel]`);

    return NextResponse.json({ success: true, date });
  } catch (err) {
    console.error("Error editing news:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to edit news" },
      { status: 500 }
    );
  }
}