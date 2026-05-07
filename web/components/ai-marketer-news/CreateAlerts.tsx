"use client";

import { useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

// Stateless Telegram entry point. The actual subscription / section selection
// lives entirely inside the @WeLike_Alerts_bot via inline-keyboard menus
// (see web/app/api/telegram/webhook/route.ts) — there is no DB write here,
// no chat-id tracking on the website side. The user opens the bot, hits
// /start, picks AI News or Social Listening, and picks a section. Done.

const BOT_USERNAME = "WeLike_Alerts_bot";
const BOT_DEEP_LINK = `https://t.me/${BOT_USERNAME}`;

// `issue` is still passed by the parent server page from the previous design
// — keep the prop signature loose so we don't force a parent change.
export default function CreateAlerts(_props: { issue?: unknown }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full rounded-xl border border-surface-800 bg-surface-900/50 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-8 py-7 hover:bg-surface-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg border border-surface-700 bg-surface-800/50 flex items-center justify-center">
            <Bell className="h-4 w-4 text-brand-500" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-semibold text-white">Create Alerts</h2>
            <p className="text-xs text-surface-500 font-light">
              Get today&apos;s issue delivered to Telegram on demand
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-surface-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-surface-500" />
        )}
      </button>

      {expanded && (
        <div className="px-8 pb-8 border-t border-surface-800 pt-8 space-y-6">
          {/* Hero copy */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white">
              Read on Telegram, your way
            </h3>
            <p className="text-sm text-surface-400 leading-relaxed">
              Open the bot and hit <span className="font-mono text-brand-500">/start</span>.
              Pick <span className="text-white">AI News</span> or{" "}
              <span className="text-white">Social Listening</span>, then choose a
              section — Daily Brief, Growth Insight, Launch Radar, Daily Case,
              or All. The bot replies inline, instantly.
            </p>
            <p className="text-xs text-surface-600 leading-relaxed">
              No subscription, no scheduled push — you decide what to read and
              when.
            </p>
          </div>

          {/* Primary CTA — open bot */}
          <a
            href={BOT_DEEP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-4 text-sm font-semibold text-black hover:bg-brand-400 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Open @{BOT_USERNAME}
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>

          {/* Command quick-reference */}
          <div className="rounded-lg border border-surface-800 bg-surface-900/60 p-4">
            <p className="text-[11px] uppercase tracking-widest text-surface-500 mb-3">
              Bot commands
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
              <CommandRow cmd="/start" desc="Main menu" />
              <CommandRow cmd="/ainews" desc="Section picker" />
              <CommandRow cmd="/help" desc="Show commands" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommandRow({ cmd, desc }: { cmd: string; desc: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <code className="font-mono text-brand-500 text-xs">{cmd}</code>
      <span className="text-surface-500 text-[11px]">{desc}</span>
    </div>
  );
}
