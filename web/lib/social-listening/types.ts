/**
 * Shared TypeScript types for the Social Listening module.
 *
 * Mirrors the data shapes used in welike-social-listening-main but in TS.
 * Anything that crosses the API boundary (route → component) lives here.
 */

export type Lang = "en" | "zh";

export type Sentiment = "positive" | "negative" | "neutral" | "mixed";
export type ClassifierSentiment = "positive" | "negative" | "neutral";
export type Category =
  | "key_voice"
  | "feature_request"
  | "bug_issue"
  | "competitor"
  | "general";
export type Urgency = "high" | "medium" | "low";
export type Action =
  | "reply_now"
  | "log_product"
  | "monitor"
  | "share_amplify"
  | "ignore";
export type TimeRange = "24h" | "7d" | "14d";

/** A single collected tweet, post-classification. */
export interface Tweet {
  id: string;
  text: string;
  author_username: string;
  author_name?: string;
  author_followers?: number;
  author_verified?: boolean;
  created_at: string; // ISO 8601 (UTC)
  likes: number;
  retweets: number;
  replies: number;
  quotes?: number;
  bookmarks?: number;
  views?: number;
  engagement: number;
  url: string;
  // After classify_tweets:
  sentiment?: ClassifierSentiment;
  sentiment_score?: number;
  category?: Category;
  urgency?: Urgency;
  action?: Action;
  summary?: string;
}

export interface Topic {
  topic: string;
  count: number;
  sentiment: Sentiment;
  urgency: Urgency;
  action: string;
  tweet_ids: number[]; // 1-based indices into the analysis tweets array
}

export interface Narrative {
  narrative: string;
  phase: "emerging" | "heating" | "peaking" | "declining";
  reach: "high" | "medium" | "low";
  kols: string[];
  tweet_ids: number[];
  recommendation: string;
}

export interface KeywordEntry {
  word: string;
  count: number;
}

export interface SentimentCounts {
  positive: number;
  negative: number;
  neutral: number;
}

export interface CategoryCounts {
  key_voice: number;
  feature_request: number;
  bug_issue: number;
  competitor: number;
  general: number;
}

export interface UrgencyCounts {
  high: number;
  medium: number;
  low: number;
}

export interface AnalyzeResult {
  query: string;
  time_range: TimeRange;
  total_tweets: number;
  tweets: Tweet[];
  topics: Topic[];
  narratives?: Narrative[];
  keywords: KeywordEntry[];
  sentiment_counts: SentimentCounts;
  category_counts: CategoryCounts;
  urgency_counts: UrgencyCounts;
  generated_at: string;
}

// ── Timeline ────────────────────────────────────────────────────────────────

export interface TimelineBucket {
  date: string; // YYYY-MM-DD
  tweets: number;
  engagement: number;
  sentiment_avg?: number; // -1..1
}

export interface Milestone {
  date: string;
  title: string;
  description: string;
  kind?: "peak" | "shift" | "kol_amplify" | "controversy" | "other";
}

export interface TimelinePayload {
  buckets: TimelineBucket[];
  milestones: Milestone[];
}

// ── Smart Alerts (matches AlertDict in db.ts) ───────────────────────────────

export interface AlertView {
  id: number;
  chat_id: number;
  handles: string[];
  keywords: string[];
  sentiment_filter: string;
  urgency_filter: string;
  digest_mode: boolean;
  active: boolean;
  interval_min: number;
  created_at: string | null;
  last_run_at: string | null;
}

// ── Chat / reply payloads ───────────────────────────────────────────────────

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ReplyDraft {
  reply: string;
  notes?: string;
}
