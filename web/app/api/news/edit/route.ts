import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

export async function PUT(request: Request) {
  try {
    const { date, frontmatter, body } = await request.json();

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const filePath = path.join(CONTENT_DIR, `${date}.md`);

    // Read existing file to preserve published state
    let existingPublished = false;
    try {
      const existing = await fs.readFile(filePath, "utf8");
      const { data } = matter(existing);
      existingPublished = data.published === true;
    } catch {
      // File doesn't exist yet
    }

    // Build new frontmatter
    const mergedFrontmatter = {
      ...frontmatter,
      published: existingPublished, // preserve publish state
      date: date,
    };

    // Reconstruct the markdown file
    const newContent = matter.stringify(body || "", mergedFrontmatter);

    await fs.writeFile(filePath, newContent, "utf8");

    return NextResponse.json({ success: true, date });
  } catch (err) {
    console.error("Error editing news:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to edit news" },
      { status: 500 }
    );
  }
}