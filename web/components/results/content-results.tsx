"use client";
import { useState } from "react";
import { Copy, Check, Globe, Mail, MessageCircle, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentAsset {
  platform: string;
  type: string;
  title?: string;
  content: string;
}

const PLATFORM_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  twitter: { label: "Twitter/X", icon: MessageCircle, color: "text-sky-400" },
  producthunt: { label: "Product Hunt", icon: Globe, color: "text-orange-400" },
  hackernews: { label: "Hacker News", icon: Globe, color: "text-orange-500" },
  website: { label: "Landing Page", icon: Globe, color: "text-brand-500" },
  email: { label: "Email", icon: Mail, color: "text-purple-400" },
  linkedin: { label: "LinkedIn", icon: Briefcase, color: "text-blue-400" },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-white bg-surface-800 hover:bg-surface-700 px-3 py-1.5 rounded transition-colors"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-brand-500" /> Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" /> Copy
        </>
      )}
    </button>
  );
}

export function ContentResults({ data }: { data: { assets: ContentAsset[] } }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-surface-800 mb-6 overflow-x-auto">
        {data.assets.map((asset, i) => {
          const config = PLATFORM_CONFIG[asset.platform] || {
            label: asset.platform,
            icon: Globe,
            color: "text-surface-400",
          };
          const Icon = config.icon;

          return (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                activeTab === i
                  ? "border-brand-500 text-brand-500"
                  : "border-transparent text-surface-400 hover:text-white"
              )}
            >
              <Icon className={cn("h-4 w-4", activeTab === i ? config.color : "")} />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Active content */}
      {data.assets[activeTab] && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-white">
                {data.assets[activeTab].title || data.assets[activeTab].type}
              </h4>
              <span className="bg-surface-800 text-surface-500 text-xs px-2 py-0.5 rounded">
                {data.assets[activeTab].platform}/{data.assets[activeTab].type}
              </span>
            </div>
            <CopyButton text={data.assets[activeTab].content} />
          </div>
          <div className="bg-surface-900 rounded-lg border border-surface-800 p-6">
            <pre className="text-sm text-surface-300 whitespace-pre-wrap font-sans leading-relaxed">
              {data.assets[activeTab].content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
