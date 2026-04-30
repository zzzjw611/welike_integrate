"use client";

import { ExternalLink, Heart, Repeat2, Bookmark, Eye, MessageSquare, Loader2, X } from "lucide-react";
import { t, catLabel, urgLabel, actionLabel, typeLabel, formatCount, CATEGORY_COLORS } from "./i18n";

interface Tweet {
  text: string; author_username: string; author_followers?: number; author_verified?: boolean;
  sentiment: "positive" | "negative" | "neutral"; category: string; urgency: "high" | "medium" | "low";
  action: string; tweet_type: string; summary?: string; engagement?: number; replies?: number;
  retweets?: number; likes?: number; bookmarks?: number; impressions?: number; lang?: string; url?: string; created_at?: string;
}

export function TweetCard({
  tweet, idx, lang, replyLoading, replyTweetIdx, replyDraft, onGenerateReply, onCopyDraft, copied, onCloseReply,
}: {
  tweet: Tweet; idx: number; lang: string;
  replyLoading: boolean; replyTweetIdx: number | null; replyDraft: string;
  onGenerateReply: (idx: number) => void; onCopyDraft: () => void; copied: boolean; onCloseReply: () => void;
}) {
  const isReplying = replyTweetIdx === idx;

  return (
    <div className="rounded-lg border border-surface-800 bg-surface-950 p-4 hover:border-surface-700 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-6 w-6 rounded-full bg-surface-800 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-semibold text-surface-400">
              {tweet.author_username?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-white truncate">@{tweet.author_username}</span>
              {tweet.author_verified && <span className="text-brand-500 text-[10px]">✓</span>}
            </div>
            {tweet.author_followers != null && (
              <span className="text-[10px] text-surface-500">{formatCount(tweet.author_followers)} {t("followers_suffix", lang)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
            backgroundColor: tweet.sentiment === "positive" ? "#06f5b722" : tweet.sentiment === "negative" ? "#ff5c7a22" : "#8b9aff22",
            color: tweet.sentiment === "positive" ? "#06f5b7" : tweet.sentiment === "negative" ? "#ff5c7a" : "#8b9aff",
          }}>
            {tweet.sentiment === "positive" ? (lang === "zh" ? "积极" : "Pos") : tweet.sentiment === "negative" ? (lang === "zh" ? "消极" : "Neg") : (lang === "zh" ? "中性" : "Neu")}
          </span>
          <span className="text-[10px] text-surface-500">{typeLabel(tweet.tweet_type, lang)}</span>
        </div>
      </div>

      <p className="text-sm text-surface-300 mb-2 leading-relaxed line-clamp-3">{tweet.text}</p>

      {tweet.summary && (
        <p className="text-xs text-surface-500 italic mb-2 border-l-2 border-surface-700 pl-3">{tweet.summary}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: CATEGORY_COLORS[tweet.category] + "22", color: CATEGORY_COLORS[tweet.category] }}>
          {catLabel(tweet.category, lang)}
        </span>
        <span className="text-[10px] text-surface-500">{urgLabel(tweet.urgency, lang)}</span>
        <span className="text-[10px] text-surface-500">{t("suggested_action", lang)} <span className="text-surface-300">{actionLabel(tweet.action, lang)}</span></span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-surface-500">
          {tweet.likes != null && <span className="flex items-center gap-1 text-[10px]"><Heart className="h-3 w-3" />{formatCount(tweet.likes)}</span>}
          {tweet.retweets != null && <span className="flex items-center gap-1 text-[10px]"><Repeat2 className="h-3 w-3" />{formatCount(tweet.retweets)}</span>}
          {tweet.replies != null && <span className="flex items-center gap-1 text-[10px]"><MessageSquare className="h-3 w-3" />{formatCount(tweet.replies)}</span>}
          {tweet.bookmarks != null && <span className="flex items-center gap-1 text-[10px]"><Bookmark className="h-3 w-3" />{formatCount(tweet.bookmarks)}</span>}
          {tweet.impressions != null && <span className="flex items-center gap-1 text-[10px]"><Eye className="h-3 w-3" />{formatCount(tweet.impressions)}</span>}
        </div>
        <div className="flex items-center gap-2">
          {tweet.url && (
            <a href={tweet.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-surface-500 hover:text-brand-500 transition-colors">
              <ExternalLink className="h-3 w-3" />{t("view_original", lang)}
            </a>
          )}
          <button onClick={() => onGenerateReply(idx)}
            className="text-[10px] text-surface-500 hover:text-brand-500 transition-colors">
            {t("reply_now", lang)}
          </button>
        </div>
      </div>

      {/* Reply Draft */}
      {isReplying && (
        <div className="mt-3 pt-3 border-t border-surface-800">
          {replyLoading ? (
            <div className="flex items-center gap-2 text-xs text-surface-500">
              <Loader2 className="h-3 w-3 animate-spin" />{t("reply_loading", lang)}
            </div>
          ) : replyDraft ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white">{t("reply_draft", lang)}</span>
                <div className="flex items-center gap-2">
                  <button onClick={onCopyDraft}
                    className="text-[10px] text-surface-500 hover:text-brand-500 transition-colors">
                    {copied ? t("copied", lang) : t("copy", lang)}
                  </button>
                  <button onClick={onCloseReply} className="text-surface-500 hover:text-white transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-surface-300 bg-surface-900 rounded-lg p-3">{replyDraft}</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
