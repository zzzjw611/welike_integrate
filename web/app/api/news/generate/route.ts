import { NextResponse } from "next/server";
import { writeContentFile } from "@/lib/github-storage";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_BASE = "https://api.deepseek.com/v1";

async function callDeepSeek(messages: any[], temperature = 0.7, maxTokens = 4096) {
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

function parseJSON(content: string) {
  let cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  return JSON.parse(cleaned);
}

function buildSystemPrompt(dateStr: string) {
  const today = new Date(dateStr + "T12:00:00Z");
  const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" });

  return `You are a senior AI industry analyst and marketing strategist at JE Labs. Today is ${dateStr} (${dayOfWeek}).

Your job is to produce a daily AI marketing newsletter issue covering news from the past 24 hours (Pacific Time). The issue must be based on REAL news. Do NOT make up stories.

Output ONLY raw JSON (no markdown fences, no explanation). Use this exact structure:

{
  "date": "${dateStr}",
  "issueNumber": <current issue number, use a reasonable number>,
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
- The "commentary" field should give actionable advice`;
}

function buildUserPrompt(dateStr: string) {
  return `Generate a complete AI Marketer News issue for ${dateStr}. 

Research and include REAL stories from the past 48 hours. Focus on:
1. Major AI/tech news that impacts marketers
2. Real growth insights from known experts
3. Actual product launches (check Product Hunt, TechCrunch, company blogs)
4. A real marketing case study

Make sure every story has a real URL. The content should be valuable for B2B marketers, brand managers, and growth teams.`;
}

function buildFrontmatterYaml(issueData: any): string {
  const { data } = issueData;
  const yaml = `---
published: false
date: ${data.date}
issueNumber: ${data.issueNumber || 0}
editor: JE Labs
highlight:
  bullets:
${(data.highlight?.bullets || []).map((b: string) => `    - "${b}"`).join("\n")}
briefs:
${(data.briefs || [])
  .map(
    (b: any) => `  - title: "${b.title}"
    summary: "${b.summary}"
    source: "${b.source}"
    url: "${b.url}"
    soWhat: "${b.soWhat || ""}"`
  )
  .join("\n")}
growth_insights:
${(data.growth_insights || [])
  .map(
    (g: any) => `  - author: "${g.author}"
    handle: "${g.handle}"
    platform: "${g.platform}"
    quote: "${g.quote}"
    url: "${g.url}"
    commentary: "${g.commentary || ""}"`
  )
  .join("\n")}
launches:
${(data.launches || [])
  .map(
    (l: any) => `  - product: "${l.product}"
    company: "${l.company}"
    category: "${l.category}"
    tag: "${l.tag || "Rising"}"
    summary: "${l.summary}"
    url: "${l.url}"
    metric: "${l.metric || ""}"`
  )
  .join("\n")}
daily_case:
  company: "${data.daily_case?.company || ""}"
  title: "${data.daily_case?.title || ""}"
  deck: "${data.daily_case?.deck || ""}"
  metrics:
${(data.daily_case?.metrics || []).map((m: string) => `    - "${m}"`).join("\n")}
---
`;
  return yaml;
}

export async function POST(request: Request) {
  try {
    const { date } = await request.json();
    const targetDate = date || new Date().toISOString().slice(0, 10);

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Step 1: Generate frontmatter JSON
    const sysPrompt = buildSystemPrompt(targetDate);
    const userPrompt = buildUserPrompt(targetDate);

    const frontmatterContent = await callDeepSeek([
      { role: "system", content: sysPrompt },
      { role: "user", content: userPrompt },
    ]);

    const issueData = parseJSON(frontmatterContent);

    // Step 2: Generate daily_case body content
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
        bodyContent = bodyContent
          .replace(/```markdown\s*/g, "")
          .replace(/```\s*/g, "")
          .trim();
      } catch {
        bodyContent = "";
      }
    }

    // Step 3: Build markdown file
    const frontmatterYaml = buildFrontmatterYaml({ data: issueData });
    const fullContent = frontmatterYaml + "\n" + bodyContent;

    // Step 4: Save to GitHub (master branch, triggers Vercel deploy)
    await writeContentFile(
      targetDate,
      fullContent,
      `chore: manually generate AI news for ${targetDate}`
    );

    return NextResponse.json({
      success: true,
      date: targetDate,
      issueNumber: issueData.issueNumber,
      title: issueData.daily_case?.title || "",
    });
  } catch (err) {
    console.error("Error generating news:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate news" },
      { status: 500 }
    );
  }
}
