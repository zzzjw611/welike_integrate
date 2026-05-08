/**
 * X / Twitter tweet collector — TS port of backend/collectors/twitter.py +
 * x_api.py from welike-social-listening-main.
 *
 * Smart router:
 *   1. If X_BEARER_TOKEN is set → official X API v2 (dual-pass relevancy +
 *      recency, multi-page).
 *   2. On 403 (free-tier denial) and TWITTERAPI_KEY present → fall back to
 *      twitterapi.io.
 *   3. Otherwise twitterapi.io directly.
 */
import type { Tweet, TimeRange } from "@/lib/social-listening/types";

const X_SEARCH_URL = "https://api.x.com/2/tweets/search/recent";
const TWITTERAPI_URL =
  "https://api.twitterapi.io/twitter/tweet/advanced_search";

const TIME_RANGE_HOURS: Record<string, number> = {
  "24h": 24,
  "7d": 24 * 7,
  "14d": 24 * 14,
};

// ────────────────────────────────────────────────────────────────────────────
// Query construction
// ────────────────────────────────────────────────────────────────────────────

/**
 * X API v2 search query — multi-language, no retweets. URL-based queries
 * expand into name + handle + stripped-suffix variants so a project's bare
 * name still hits.
 */
function buildXQuery(rawQuery: string): string {
  const q = rawQuery.trim();
  if (q.includes("twitter.com/") || q.includes("x.com/")) {
    const parts = q.replace(/\/+$/, "").split("/");
    const username =
      parts.length >= 2 && parts[parts.length - 2] === "status"
        ? parts[parts.length - 3].replace(/^@/, "")
        : parts[parts.length - 1].replace(/^@/, "");
    const variants = new Set<string>([`@${username}`, username]);
    const suffixes = [
      "ai",
      "labs",
      "lab",
      "network",
      "io",
      "xyz",
      "fi",
      "hq",
      "app",
    ];
    for (const suffix of suffixes) {
      const lower = username.toLowerCase();
      if (lower.endsWith(suffix) && username.length > suffix.length + 2) {
        variants.add(username.slice(0, -suffix.length));
        break;
      }
    }
    const ordered = [...variants].sort((a, b) => b.length - a.length);
    return `(${ordered.join(" OR ")}) -from:${username} -is:retweet`;
  }
  return `${q} -is:retweet`;
}

/**
 * twitterapi.io advanced_search query — uses since_time:<unix> instead of
 * start_time. Single-handle URL-based queries collapse to `@user -from:user`.
 */
function buildTwitterApiQuery(
  rawQuery: string,
  timeRange: TimeRange | string
): string {
  const hours = TIME_RANGE_HOURS[timeRange] ?? TIME_RANGE_HOURS["7d"];
  const sinceTs = Math.floor(Date.now() / 1000 - hours * 3600);
  const q = rawQuery.trim();
  if (q.includes("twitter.com/") || q.includes("x.com/")) {
    const parts = q.replace(/\/+$/, "").split("/");
    const username =
      parts.length >= 2 && parts[parts.length - 2] === "status"
        ? parts[parts.length - 3].replace(/^@/, "")
        : parts[parts.length - 1].replace(/^@/, "");
    return `@${username} -from:${username} since_time:${sinceTs} -is:retweet`;
  }
  return `${q} since_time:${sinceTs} -is:retweet`;
}

// ────────────────────────────────────────────────────────────────────────────
// Tweet parsing — both APIs normalised into the same Tweet shape
// ────────────────────────────────────────────────────────────────────────────

function classifyXTweetType(raw: any): string {
  const refs = raw.referenced_tweets || [];
  for (const r of refs) {
    if (r?.type === "quoted") return "quote";
    if (r?.type === "replied_to") return "reply";
  }
  return "tweet";
}

function parseXTweet(raw: any, usersById: Record<string, any>): Tweet {
  const authorId = raw.author_id || "";
  const user = (authorId && usersById[authorId]) || {};
  const metrics = raw.public_metrics || {};
  const authorMetrics = user.public_metrics || {};

  const username: string = user.username || "unknown";
  const tweetId = String(raw.id || "");

  const likes = Number(metrics.like_count || 0);
  const retweets = Number(metrics.retweet_count || 0);
  const replies = Number(metrics.reply_count || 0);
  const quotes = Number(metrics.quote_count || 0);
  const bookmarks = Number(metrics.bookmark_count || 0);
  const views = Number(metrics.impression_count || 0);

  const engagement =
    likes + retweets * 2 + replies + quotes * 3 + bookmarks * 5;

  return {
    id: tweetId,
    text: raw.text || "",
    author_username: username,
    author_name: user.name || username,
    author_followers: Number(authorMetrics.followers_count || 0),
    author_verified:
      Boolean(user.verified) ||
      ["blue", "business", "government"].includes(user.verified_type),
    created_at: raw.created_at || "",
    likes,
    retweets,
    replies,
    quotes,
    bookmarks,
    views,
    engagement,
    url: tweetId ? `https://x.com/${username}/status/${tweetId}` : "",
  } as Tweet;
}

function parseTwitterApiTweet(raw: any): Tweet {
  const author = raw.author || raw.user || {};
  const metrics = raw.public_metrics || {};
  const tweetId = String(raw.id || raw.id_str || "");
  const username: string =
    author.userName || author.username || author.screen_name || "unknown";
  const followers =
    author.followers ||
    author.followers_count ||
    author.followersCount ||
    0;
  const verified = Boolean(
    author.isVerified || author.verified || author.isBlueVerified
  );

  const likes = Number(
    raw.likeCount ?? metrics.like_count ?? raw.favorite_count ?? 0
  );
  const retweets = Number(
    raw.retweetCount ?? metrics.retweet_count ?? raw.retweet_count ?? 0
  );
  const replies = Number(raw.replyCount ?? metrics.reply_count ?? 0);
  const quotes = Number(raw.quoteCount ?? metrics.quote_count ?? 0);
  const bookmarks = Number(raw.bookmarkCount ?? metrics.bookmark_count ?? 0);
  const views = Number(raw.viewCount ?? metrics.impression_count ?? 0);

  const engagement =
    likes + retweets * 2 + replies + quotes * 3 + bookmarks * 5;

  return {
    id: tweetId,
    text: raw.text || raw.full_text || "",
    author_username: username,
    author_name: author.name || username,
    author_followers: Number(followers) || 0,
    author_verified: verified,
    created_at: raw.createdAt || raw.created_at || "",
    likes,
    retweets,
    replies,
    quotes,
    bookmarks,
    views,
    engagement,
    url: tweetId ? `https://x.com/${username}/status/${tweetId}` : "",
  } as Tweet;
}

// ────────────────────────────────────────────────────────────────────────────
// X API v2 collector (dual-pass relevancy + recency, paginated)
// ────────────────────────────────────────────────────────────────────────────

interface FetchOnePassOpts {
  query: string;
  sortOrder: "relevancy" | "recency";
  startTime: string;
  token: string;
  pages: number;
}

async function fetchOneXPass(opts: FetchOnePassOpts): Promise<Tweet[]> {
  const { query, sortOrder, startTime, token, pages } = opts;
  const all: Tweet[] = [];
  let nextToken: string | undefined;

  for (let page = 0; page < pages; page++) {
    const params = new URLSearchParams({
      query,
      max_results: "100",
      start_time: startTime,
      sort_order: sortOrder,
      "tweet.fields":
        "created_at,public_metrics,author_id,lang,referenced_tweets,conversation_id",
      expansions: "author_id",
      "user.fields":
        "username,name,public_metrics,verified,verified_type",
    });
    if (nextToken) params.set("next_token", nextToken);

    let res: Response | null = null;
    let retried = 0;
    // Retry only on 429 (rate-limit) — up to 3 attempts.
    while (retried < 3) {
      res = await fetch(`${X_SEARCH_URL}?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "WeLike-Social-Listening/1.0",
        },
      });
      if (res.status === 401) {
        throw new XApiError(
          401,
          "X API authentication failed: invalid or expired Bearer Token"
        );
      }
      if (res.status === 403) {
        const body = await res.text().catch(() => "");
        throw new XApiError(
          403,
          `X API denied request (403). search/recent requires Basic tier or higher. ${body.slice(0, 200)}`
        );
      }
      if (res.status === 429) {
        await sleep(3000);
        retried++;
        continue;
      }
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new XApiError(
          res.status,
          `X API error ${res.status}: ${body.slice(0, 300)}`
        );
      }
      break;
    }
    if (!res || res.status === 429) break; // 429 retried out

    const data = (await res.json()) as any;
    const includes = data.includes || {};
    const usersById: Record<string, any> = {};
    for (const u of includes.users || []) {
      usersById[u.id] = u;
    }
    for (const raw of data.data || []) {
      all.push(parseXTweet(raw, usersById));
    }
    nextToken = data.meta?.next_token;
    if (!nextToken) break;
  }

  return all;
}

class XApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "XApiError";
  }
}

async function collectTweetsX(
  query: string,
  timeRange: TimeRange | string
): Promise<Tweet[]> {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) throw new Error("X_BEARER_TOKEN not set");

  // Recent search endpoint is capped at last 7 days on most tiers.
  const requested = TIME_RANGE_HOURS[timeRange] ?? TIME_RANGE_HOURS["7d"];
  const hours = Math.min(requested, 24 * 7);
  const startTime = new Date(Date.now() - hours * 3600 * 1000)
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z");

  // Dual-pass + adaptive page count (matches Python).
  const pages = timeRange === "24h" ? 1 : timeRange === "7d" ? 2 : 3;

  const fullQuery = buildXQuery(query);
  const seen = new Map<string, Tweet>();

  for (const sortOrder of ["relevancy", "recency"] as const) {
    try {
      const batch = await fetchOneXPass({
        query: fullQuery,
        sortOrder,
        startTime,
        token: decodeURIComponent(token),
        pages,
      });
      for (const t of batch) {
        if (t.id && !seen.has(t.id)) seen.set(t.id, t);
      }
    } catch (err) {
      // If one sort already produced results, swallow the second pass failure.
      if (seen.size > 0) break;
      throw err;
    }
  }

  return [...seen.values()];
}

// ────────────────────────────────────────────────────────────────────────────
// twitterapi.io fallback (cursor-paginated)
// ────────────────────────────────────────────────────────────────────────────

async function collectTweetsTwitterApi(
  query: string,
  maxResults: number,
  timeRange: TimeRange | string
): Promise<Tweet[]> {
  const apiKey = process.env.TWITTERAPI_KEY;
  if (!apiKey) {
    throw new Error(
      "Neither X_BEARER_TOKEN nor TWITTERAPI_KEY configured — cannot collect tweets"
    );
  }

  const tweets: Tweet[] = [];
  let cursor: string | undefined;

  while (tweets.length < maxResults) {
    const params = new URLSearchParams({
      query: buildTwitterApiQuery(query, timeRange),
      queryType: "Latest",
    });
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(`${TWITTERAPI_URL}?${params.toString()}`, {
      method: "GET",
      headers: { "X-API-Key": apiKey },
    });

    if (res.status === 401) {
      throw new Error(
        "twitterapi.io authentication failed — check TWITTERAPI_KEY"
      );
    }
    if (res.status === 429) {
      await sleep(2000);
      continue;
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `twitterapi.io error ${res.status}: ${body.slice(0, 300)}`
      );
    }

    const data = (await res.json()) as any;
    const rawTweets =
      data.tweets || data.data || data.results || [];

    if (
      typeof data === "object" &&
      !rawTweets.length &&
      (data.message || data.error || data.msg)
    ) {
      throw new Error(
        `twitterapi.io rejected request: ${data.message || data.error || data.msg}`
      );
    }
    if (!rawTweets.length) break;

    for (const raw of rawTweets) {
      tweets.push(parseTwitterApiTweet(raw));
      if (tweets.length >= maxResults) break;
    }

    const hasNext = data.has_next_page || data.hasNextPage || false;
    cursor = data.next_cursor || data.nextCursor || undefined;
    if (!hasNext || !cursor) break;
  }

  return tweets.slice(0, maxResults);
}

// ────────────────────────────────────────────────────────────────────────────
// Public entry
// ────────────────────────────────────────────────────────────────────────────

export async function collectTweets(
  query: string,
  maxResults = 200,
  timeRange: TimeRange | string = "7d"
): Promise<Tweet[]> {
  // X bearer token first, fall back to twitterapi.io on 403 (or any failure
  // when a fallback key is configured) to mirror Python behavior.
  if (process.env.X_BEARER_TOKEN) {
    try {
      return await collectTweetsX(query, timeRange);
    } catch (err) {
      if (process.env.TWITTERAPI_KEY) {
        // eslint-disable-next-line no-console
        console.warn(
          `[twitter] X API failed (${err instanceof Error ? err.message : err}), falling back to twitterapi.io`
        );
      } else {
        throw err;
      }
    }
  }
  return collectTweetsTwitterApi(query, maxResults, timeRange);
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// Re-exports useful for callers (analyze flow, scheduler).
export { buildXQuery, buildTwitterApiQuery };
