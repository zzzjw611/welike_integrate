"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import matter from "gray-matter";
import type { Issue } from "@/lib/ai-marketer-news";
import Masthead from "@/components/ai-marketer-news/Masthead";
import HighlightSummary from "@/components/ai-marketer-news/HighlightSummary";
import DailyBrief from "@/components/ai-marketer-news/DailyBrief";
import GrowthInsightSection from "@/components/ai-marketer-news/GrowthInsight";
import LaunchRadar from "@/components/ai-marketer-news/LaunchRadar";
import DailyCaseSection from "@/components/ai-marketer-news/DailyCase";
import IssueSwitcher from "@/components/ai-marketer-news/IssueSwitcher";
import PastIssues from "@/components/ai-marketer-news/PastIssues";
import Footer from "@/components/ai-marketer-news/Footer";
import BackToTop from "@/components/ai-marketer-news/BackToTop";
import DatePicker from "@/components/ai-marketer-news/DatePicker";
import GuideButton from "@/components/ai-marketer-news/GuideButton";

const GITHUB_OWNER = "zzzjw611";
const GITHUB_REPO = "welike_integrate";
const GITHUB_BRANCH = "master";

// Simple in-memory cache to avoid hitting GitHub API rate limits
const cache = new Map<string, { data: Issue; ts: number }>();
const CACHE_TTL = 10_000; // 10 seconds

async function fetchFromGitHub(date: string, skipCache = false): Promise<Issue | null> {
  // Check cache first (unless skipCache is true, e.g. from admin preview)
  if (!skipCache) {
    const cached = cache.get(date);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return cached.data;
    }
  }

  // Read from master branch only (content branch was deleted)
  const branches = ["master"];
  for (const branch of branches) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/web/content/${date}.md?ref=${branch}`,
        { headers: { Accept: "application/vnd.github.v3+json" } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      // Use fetch to get raw content with proper encoding (avoids atob UTF-8 issues)
      const rawRes = await fetch(data.download_url);
      const raw = await rawRes.text();
      const { data: frontmatter } = matter(raw);
      const issue: Issue = {
        date: date,
        issueNumber: frontmatter.issueNumber,
        editor: frontmatter.editor,
        highlight: frontmatter.highlight,
        briefs: frontmatter.briefs ?? [],
        growth_insights: frontmatter.growth_insights ?? [],
        launches: frontmatter.launches ?? [],
        daily_case: {
          company: frontmatter.daily_case?.company ?? "",
          title: frontmatter.daily_case?.title ?? "",
          deck: frontmatter.daily_case?.deck ?? "",
          metrics: frontmatter.daily_case?.metrics,
          bodyHtml: "",
        },
      };
      cache.set(date, { data: issue, ts: Date.now() });
      return issue;
    } catch {
      continue;
    }
  }
  return null;
}

export default function ArchivePage() {
  const params = useParams();
  const date = params.date as string;
  const [cacheBust, setCacheBust] = useState(0);

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [prev, setPrev] = useState<string | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [pastSummaries, setPastSummaries] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Check if URL has cache-busting param (from admin preview)
        const skipCache = typeof window !== "undefined" && window.location.search.includes("t=");
        // Fetch issue data directly from GitHub API (always latest, no Vercel deploy delay)
        const issueData = await fetchFromGitHub(date, skipCache);
        setIssue(issueData);

        // Fetch all published issues for navigation
        const pubRes = await fetch("/api/news/archive");
        if (pubRes.ok) {
          const pubData = await pubRes.json();
          const dates = (pubData.issues || []).map((d: any) => d.date);
          setIssues(dates);

          const idx = dates.indexOf(date);
          setPrev(idx < dates.length - 1 ? dates[idx + 1] : null);
          setNext(idx > 0 ? dates[idx - 1] : null);
        }
      } catch (err) {
        console.error("Failed to fetch issue:", err);
        setIssue(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [date]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-surface-500 text-sm">Issue not found</p>
        </div>
      </div>
    );
  }

  const isLatest = issues.length > 0 && issues[0] === date;

  return (
    <div
      className="min-h-full"
      style={{
        background:
          "radial-gradient(ellipse 900px 600px at 10% 0%,rgba(0,245,160,.055) 0%,transparent 65%),radial-gradient(ellipse 700px 500px at 90% 100%,rgba(90,171,255,.05) 0%,transparent 60%),#07090d",
      }}
    >
      {/* Top bar with IssueSwitcher + DatePicker */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <IssueSwitcher
            current={date}
            prev={prev}
            next={next}
            isLatest={isLatest}
          />
        </div>
        <DatePicker issues={issues} currentDate={date} />
      </div>

      <Masthead
        date={issue.date}
        issueNumber={issue.issueNumber}
        editor={issue.editor}
      />

      <HighlightSummary highlight={issue.highlight} />

      <DailyBrief items={issue.briefs} />

      <GrowthInsightSection items={issue.growth_insights} />

      <LaunchRadar items={issue.launches} />

      <DailyCaseSection caseItem={issue.daily_case} />

      <PastIssues issues={pastSummaries} />

      <Footer />

      <BackToTop />
      <GuideButton />
    </div>
  );
}