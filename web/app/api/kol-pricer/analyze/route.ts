import { NextRequest } from "next/server";
import { getUserByUsername, getUserTweets } from "@/lib/kol-pricer/x-api";
import { analyzeAccount } from "@/lib/kol-pricer/anthropic";
import {
  calculateScores,
  calculatePricing,
  trimOutliers,
  removeIQROutliers,
} from "@/lib/kol-pricer/scoring";
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "@/lib/kol-pricer/constants";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((entry, ip) => {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  });
}, 5 * 60 * 1000);

function parseHandle(input: string): string {
  let handle = input.trim();
  const urlMatch = handle.match(/(?:x\.com|twitter\.com)\/(@?[\w]+)/i);
  if (urlMatch) {
    handle = urlMatch[1];
  }
  handle = handle.replace(/^@/, "");
  handle = handle.split("?")[0];
  return handle;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded. Please wait a minute and try again.",
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  let handle: string;
  try {
    const body = await req.json();
    handle = parseHandle(body.handle || "");
    if (!handle) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid X handle" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function sendLog(
        message: string,
        type: "info" | "success" | "error" = "info"
      ) {
        const data = JSON.stringify({
          type: "log",
          log: { timestamp: new Date().toISOString(), message, type },
        });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }

      function sendResult(result: unknown) {
        const data = JSON.stringify({ type: "result", data: result });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }

      function sendError(error: string) {
        const data = JSON.stringify({ type: "error", error });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }

      try {
        sendLog(`Fetching profile for @${handle}...`);
        const user = await getUserByUsername(handle);
        const { followers_count, following_count, tweet_count, listed_count } =
          user.public_metrics;
        sendLog(
          `Found @${user.username} — ${followers_count.toLocaleString()} followers | listed: ${listed_count}`,
          "success"
        );

        sendLog("Fetching 30 recent original tweets...");
        const tweets = await getUserTweets(user.id, 30);
        if (tweets.length === 0) {
          sendError("No tweets found for this user");
          controller.close();
          return;
        }
        sendLog(`Loaded ${tweets.length} tweets`, "success");

        const trimmed = trimOutliers(tweets, 3);
        sendLog(
          `Trimmed top/bottom 3 by impressions → ${trimmed.length} tweets`,
          "success"
        );

        const cleaned = removeIQROutliers(trimmed);
        const iqrRemoved = trimmed.length - cleaned.length;
        if (iqrRemoved > 0) {
          sendLog(
            `IQR 1.5x filter removed ${iqrRemoved} anomalous tweets → ${cleaned.length} tweets`,
            "success"
          );
        } else {
          sendLog(
            `IQR filter: no outliers found, using ${cleaned.length} tweets`,
            "success"
          );
        }

        sendLog(
          "Analyzing with Claude AI (domain, credibility, relevance, tags)..."
        );
        const tweetTexts = tweets.map((t) => t.text);
        const {
          domain,
          subDomain,
          adRatio: claudeAdRatio,
          analysis: claudeAnalysis,
        } = await analyzeAccount(
          user.description || "",
          tweetTexts,
          followers_count,
          following_count,
          tweet_count,
          user.created_at
        );
        sendLog(`Domain: ${domain} / ${subDomain} | Ad ratio: ${claudeAdRatio}%`, "success");
        sendLog(
          `Credibility: ${claudeAnalysis.credibilityScore}/100 — ${claudeAnalysis.credibilityReason}`,
          "success"
        );
        sendLog(
          `Relevance: ${claudeAnalysis.relevanceScore}/100 — ${claudeAnalysis.relevanceReason}`,
          "success"
        );
        sendLog(
          `Tags: [${claudeAnalysis.identityTags.join(", ")}] | [${claudeAnalysis.capabilityTags.join(", ")}]`,
          "success"
        );

        sendLog("Calculating scores (V2: 4 dimensions)...");
        const scores = calculateScores(followers_count, listed_count, cleaned);
        sendLog(
          `Influence Depth: ${scores.influenceDepth} | Follower Quality: ${scores.followerQuality} | Content Stability: ${scores.contentStability} | Engagement Quality: ${scores.engagementQuality}`,
          "success"
        );
        sendLog(
          `Overall Score: ${scores.overall.toFixed(1)}/100`,
          "success"
        );

        sendLog("Computing V2 pricing (time-decay impressions + scarcity)...");
        const pricing = calculatePricing(
          scores,
          cleaned,
          followers_count,
          domain,
          subDomain,
          claudeAnalysis.credibilityScore,
          claudeAnalysis.relevanceScore,
          claudeAnalysis.identityTags,
          claudeAdRatio
        );

        sendLog(
          `CPM: $${pricing.cpm} | Weighted Imp: ${pricing.weightedImpressions.toLocaleString()}`,
          "success"
        );
        sendLog(
          `Domain(${subDomain}): ${pricing.domainMultiplier}x | Cred: ${pricing.credibilityMultiplier}x | Relev: ${pricing.relevanceMultiplier}x | Identity: ${pricing.identityMultiplier}x | Scarcity: ${pricing.scarcityFactor}x`,
          "success"
        );
        sendLog(
          `Ad ratio: ${pricing.adRatio}% | Combined modifiers: ${pricing.combinedModifiers}x`,
          "success"
        );
        sendLog(
          `Estimated price: $${pricing.price.toLocaleString()} ($${pricing.priceMin.toLocaleString()} ~ $${pricing.priceMax.toLocaleString()})`,
          "success"
        );

        sendResult({
          user,
          tweets,
          trimmedTweets: cleaned,
          domain,
          subDomain,
          scores,
          pricing,
          claudeAnalysis,
          analyzedAt: new Date().toISOString(),
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        sendError(message);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
