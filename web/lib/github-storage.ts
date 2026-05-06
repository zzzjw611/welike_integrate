const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const OWNER = "zzzjw611";
const REPO = "welike_integrate";
const BRANCH = "master";
const CONTENT_PATH = "web/content";

interface GitHubFile {
  content: string;
  sha: string;
  encoding: string;
}

async function getFile(path: string): Promise<GitHubFile | null> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub API error: ${err}`);
  }

  return res.json();
}

async function commitFile(
  path: string,
  content: string,
  message: string
): Promise<void> {
  // Try to get existing file for SHA
  let sha: string | undefined;
  try {
    const existing = await getFile(path);
    if (existing) {
      sha = existing.sha;
    }
  } catch {
    // File doesn't exist yet
  }

  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch: BRANCH,
  };

  if (sha) {
    body.sha = sha;
  }

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub commit error: ${err}`);
  }
}

export async function readContentFile(date: string): Promise<string | null> {
  const filePath = `${CONTENT_PATH}/${date}.md`;
  const file = await getFile(filePath);
  if (!file) return null;
  return Buffer.from(file.content, "base64").toString("utf8");
}

export async function writeContentFile(
  date: string,
  content: string,
  message: string
): Promise<void> {
  const filePath = `${CONTENT_PATH}/${date}.md`;
  await commitFile(filePath, content, message);
}

export async function listContentFiles(): Promise<string[]> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${CONTENT_PATH}?ref=${BRANCH}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!res.ok) return [];

  const files: { name: string; type: string }[] = await res.json();
  return files
    .filter((f) => f.type === "file" && f.name.endsWith(".md"))
    .map((f) => f.name.replace(/\.md$/, ""))
    .sort((a, b) => b.localeCompare(a));
}