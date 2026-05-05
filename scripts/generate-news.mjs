#!/usr/bin/env node

/**
 * Generate AI Marketer News issues using DeepSeek API.
 * Usage: node scripts/generate-news.mjs [date]
 *   date: optional, defaults to today. Format: YYYY-MM-DD
 *
 * If no date specified, generates for all missing dates from 2026-04-29 to today.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "..", "web", "content");

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "sk-f5c9e4006af7418ba864709b76773bba";
const DEEPSEEK_BASE = "https://api.deepseek.com/v1";


// ===== Helpers =====

function getExistingDates() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
}

function getMissingDates(from, to) {
  const existing = new Set(getExistingDates());
  const missing = [];
  const start = new Date(from);
  const end = new Date(to);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    if (!existing.has(dateStr)) {
      missing.push(dateStr);
    }
  }
  return missing;
}

async function callDeepSeek(messages, temperature = 0.7, maxTokens = 4096) {
  const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DeepSeek API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

function parseJSON(content) {
  // Try to extract JSON from markdown fences
  let cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  // Try to find JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  return JSON.parse(cleaned);
}

// ===== Generation =====

function buildSystemPrompt(dateStr, prevIssue) {
  const today = new Date(dateStr + "T12:00:00Z");
  const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" });

  let prevContext = "";
  if (prevIssue) {
    prevContext = `
Previous issue (${prevIssue.date}) highlights:
${(prevIssue.highlight?.bullets || []).join("\n")}
`;
  }

  return `You are a senior AI industry analyst and marketing strategist at JE Labs. Today is ${dateStr} (${dayOfWeek}).

Your job is to produce a daily AI marketing newsletter issue covering news from the past 24 hours (Pacific Time). The issue must be based on REAL news. Do NOT make up stories.

${prevContext}

Output ONLY raw JSON (no markdown fences, no explanation). Use this exact structure:

{
  "date": "${dateStr}",
  "issueNumber": <increment from previous>,
  "editor": "JE Labs",
  "highlight": {
    "bullets": [
      "Daily Brief · <1-sentence summary of top brief>",
      "Growth Insight · <1-sentence summary of top insight>",
      "Launch Radar · <1-sentence summary of top launch>",
      "Daily Case · <1-sentence summary of case study>"
    ]
  },
  "briefs": [
    {
      "title": "<max 15 words>",
      "summary": "<2-3 sentences>",
      "source": "<Publication name>",
      "url": "https://...",
      "soWhat": "<1-2 sentences on why this matters for marketers>"
    }
  ],
  "growth_insights": [
    {
      "author": "<Expert name>",
      "handle": "@handle",
      "platform": "<Platform>",
      "quote": "<The full insightful quote or advice, 2-4 paragraphs>",
      "url": "https://...",
      "commentary": "<1-2 sentences on how marketers can apply this>"
    }
  ],
  "launches": [
    {
      "product": "<Product name>",
      "company": "<Company name>",
      "category": "<Category>",
      "tag": "Rising",
      "summary": "<1-2 sentences>",
      "url": "https://...",
      "metric": "<key metric or vote count>"
    }
  ],
  "daily_case": {
    "company": "<Company name>",
    "title": "<Case study title>",
    "deck": "<2-3 sentence overview of the case>",
    "metrics": ["<metric 1>", "<metric 2>", "<metric 3>"]
  }
}

Requirements:
- briefs: 5-6 real AI/tech news stories with actual URLs
- growth_insights: 2 real expert insights from newsletters, podcasts, or social media
- launches: 2-3 real product launches (check Product Hunt, company announcements)
- daily_case: 1 real marketing case study with actual company details
- ALL stories must be REAL and from the past 48 hours
- Include real URLs to source articles
- The "soWhat" field should explain why each story matters for marketers specifically
- The "commentary" field should give actionable advice

For the daily_case body content (after the frontmatter), write 3-5 paragraphs of detailed case study analysis in markdown format. Include:
- Background on the company
- The specific marketing challenge or opportunity
- What they did and why it worked
- Key metrics or results
- 3 transferable lessons for other marketers`;
}

function buildUserPrompt(dateStr) {
  return `Generate a complete AI Marketer News issue for ${dateStr}. 

Research and include REAL stories from the past 48 hours. Focus on:
1. Major AI/tech news that impacts marketers
2. Real growth insights from known experts
3. Actual product launches (check Product Hunt, TechCrunch, company blogs)
4. A real marketing case study

Make sure every story has a real URL. The content should be valuable for B2B marketers, brand managers, and growth teams.`;
}

async function generateIssue(dateStr, prevIssue) {
  console.log(`\n📰 Generating issue for ${dateStr}...`);

  const sysPrompt = buildSystemPrompt(dateStr, prevIssue);
  const userPrompt = buildUserPrompt(dateStr);

  // First call: generate the frontmatter JSON
  console.log("  → Calling DeepSeek for frontmatter...");
  let frontmatterContent;
  try {
    frontmatterContent = await callDeepSeek(
      [
        { role: "system", content: sysPrompt },
        { role: "user", content: userPrompt },
      ],
      0.7,
      4096
    );
  } catch (e) {
    console.error(`  ❌ DeepSeek API error for frontmatter: ${e.message}`);
    return null;
  }

  let issueData;
  try {
    issueData = parseJSON(frontmatterContent);
  } catch (e) {
    console.error(`  ❌ Failed to parse JSON: ${e.message}`);
    console.log(`  Raw response: ${frontmatterContent.slice(0, 500)}`);
    return null;
  }

  // Second call: generate the daily_case body content
  console.log("  → Calling DeepSeek for case study body...");
  let bodyContent = "";
  if (issueData.daily_case) {
    const bodyPrompt = `Write a detailed marketing case study analysis in markdown format for:

Company: ${issueData.daily_case.company}
Title: ${issueData.daily_case.title}
Deck: ${issueData.daily_case.deck}

Write 3-5 paragraphs covering:
1. Background on the company
2. The specific marketing challenge or opportunity
3. What they did and why it worked
4. Key metrics or results
5. 3 transferable lessons for other marketers

Output ONLY the markdown content, no JSON.`;

    try {
      bodyContent = await callDeepSeek(
        [
          {
            role: "system",
            content:
              "You are a senior marketing strategist writing case study analysis. Output ONLY markdown, no JSON.",
          },
          { role: "user", content: bodyPrompt },
        ],
        0.5,
        2048
      );
      // Clean up markdown fences if present
      bodyContent = bodyContent
        .replace(/```markdown\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
    } catch (e) {
      console.error(`  ⚠️ Failed to generate body: ${e.message}`);
      bodyContent = "";
    }
  }

  // Build the final markdown file (default: unpublished draft)
  const frontmatter = `---
published: false
date: ${issueData.date}
issueNumber: ${issueData.issueNumber || 0}
editor: JE Labs
highlight:
  bullets:
${(issueData.highlight?.bullets || []).map((b) => `    - "${b}"`).join("\n")}
briefs:
${(issueData.briefs || [])
  .map(
    (b) => `  - title: "${b.title}"
    summary: "${b.summary}"
    source: "${b.source}"
    url: "${b.url}"
    soWhat: "${b.soWhat || ""}"`
  )
  .join("\n")}
growth_insights:
${(issueData.growth_insights || [])
  .map(
    (g) => `  - author: "${g.author}"
    handle: "${g.handle}"
    platform: "${g.platform}"
    quote: "${g.quote}"
    url: "${g.url}"
    commentary: "${g.commentary || ""}"`
  )
  .join("\n")}
launches:
${(issueData.launches || [])
  .map(
    (l) => `  - product: "${l.product}"
    company: "${l.company}"
    category: "${l.category}"
    tag: "${l.tag || "Rising"}"
    summary: "${l.summary}"
    url: "${l.url}"
    metric: "${l.metric || ""}"`
  )
  .join("\n")}
daily_case:
  company: "${issueData.daily_case?.company || ""}"
  title: "${issueData.daily_case?.title || ""}"
  deck: "${issueData.daily_case?.deck || ""}"
  metrics:
${(issueData.daily_case?.metrics || []).map((m) => `    - "${m}"`).join("\n")}
---
`;

  const fullContent = frontmatter + "\n" + bodyContent;

  // Write the file
  const filePath = path.join(CONTENT_DIR, `${dateStr}.md`);
  fs.writeFileSync(filePath, fullContent, "utf8");
  console.log(`  ✅ Saved to content/${dateStr}.md`);

  return issueData;
}

// ===== Main =====

async function main() {
  const targetDate = process.argv[2];

  if (targetDate) {
    // Generate for a specific date
    const existing = getExistingDates();
    const prevDate = existing.filter((d) => d < targetDate).pop();
    let prevIssue = null;
    if (prevDate) {
      try {
        const prevContent = fs.readFileSync(
          path.join(CONTENT_DIR, `${prevDate}.md`),
          "utf8"
        );
        const match = prevContent.match(/issueNumber: (\d+)/);
        if (match) {
          prevIssue = { date: prevDate, issueNumber: parseInt(match[1]) };
        }
      } catch {}
    }

    await generateIssue(targetDate, prevIssue);
  } else {
    // Generate for all missing dates from 2026-04-29 to today
    const today = new Date().toISOString().slice(0, 10);
    const missing = getMissingDates("2026-04-29", today);

    if (missing.length === 0) {
      console.log("✅ All dates are already generated!");
      return;
    }

    console.log(`📅 Missing ${missing.length} dates: ${missing.join(", ")}`);

    const existing = getExistingDates();
    let prevIssue = null;

    // Find the last existing issue for context
    const lastExisting = existing.filter((d) => d < missing[0]).pop();
    if (lastExisting) {
      try {
        const prevContent = fs.readFileSync(
          path.join(CONTENT_DIR, `${lastExisting}.md`),
          "utf8"
        );
        const match = prevContent.match(/issueNumber: (\d+)/);
        if (match) {
          prevIssue = {
            date: lastExisting,
            issueNumber: parseInt(match[1]),
            highlight: { bullets: [] },
          };
        }
      } catch {}
    }

    for (const dateStr of missing) {
      const result = await generateIssue(dateStr, prevIssue);
      if (result) {
        prevIssue = {
          date: dateStr,
          issueNumber: result.issueNumber,
          highlight: result.highlight,
        };
      }
      // Wait a bit between API calls to avoid rate limiting
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log("\n✅ Done!");
}

main().catch(console.error);
