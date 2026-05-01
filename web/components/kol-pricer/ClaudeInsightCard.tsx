"use client";
import { ClaudeAnalysis, IdentityTag, CapabilityTag } from "@/lib/kol-pricer/types";
import { useLang } from "@/lib/use-lang";
import Card from "./Card";

// Marketing-adapted Chinese translations for identity/capability tags
const IDENTITY_TAG_ZH: Record<IdentityTag, string> = {
  "Builder": "创始人",
  "KOL": "关键意见领袖",
  "Content Creator": "内容创作者",
};

const CAPABILITY_TAG_ZH: Record<CapabilityTag, string> = {
  "Branding": "品牌建设",
  "Traffic": "流量获取",
  "Trading": "交易转化",
};

interface Props {
  analysis: ClaudeAnalysis;
}

function ScoreBadge({ label, score }: { label: string; score: number }) {
  const color =
    score >= 85
      ? "text-green-400 border-green-400/30 bg-green-400/10"
      : score >= 70
        ? "text-blue-400 border-blue-400/30 bg-blue-400/10"
        : score >= 55
          ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
          : score >= 40
            ? "text-orange-400 border-orange-400/30 bg-orange-400/10"
            : "text-red-400 border-red-400/30 bg-red-400/10";

  return (
    <div className={`rounded-lg border p-3 ${color}`}>
      <p className="text-xs opacity-70">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold">{score}</p>
    </div>
  );
}

function Tag({ label, variant }: { label: string; variant: "identity" | "capability" }) {
  const style =
    variant === "identity"
      ? "border-purple-400/30 bg-purple-400/10 text-purple-400"
      : "border-cyan-400/30 bg-cyan-400/10 text-cyan-400";

  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}

export default function ClaudeInsightCard({ analysis }: Props) {
  const lang = useLang();

  return (
    <Card>
      <h3 className="mb-4 font-outfit text-lg font-semibold text-white">
        {lang === 'zh' ? 'AI 分析' : 'AI Analysis'}
      </h3>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <ScoreBadge label={lang === 'zh' ? '可信度' : 'Credibility'} score={analysis.credibilityScore} />
        <ScoreBadge label={lang === 'zh' ? '相关性' : 'Relevance'} score={analysis.relevanceScore} />
      </div>

      <div className="mb-4 space-y-2 text-sm">
        <div>
          <p className="text-xs text-surface-500">{lang === 'zh' ? '可信度' : 'Credibility'}</p>
          <p className="text-surface-300">{analysis.credibilityReason}</p>
        </div>
        <div>
          <p className="text-xs text-surface-500">{lang === 'zh' ? '相关性' : 'Relevance'}</p>
          <p className="text-surface-300">{analysis.relevanceReason}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs text-surface-500">{lang === 'zh' ? '标签' : 'Tags'}</p>
        <div className="flex flex-wrap gap-2">
          {analysis.identityTags.map((tag) => (
            <Tag key={tag} label={lang === 'zh' ? IDENTITY_TAG_ZH[tag] : tag} variant="identity" />
          ))}
          {analysis.capabilityTags.map((tag) => (
            <Tag key={tag} label={lang === 'zh' ? CAPABILITY_TAG_ZH[tag] : tag} variant="capability" />
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-surface-700 bg-surface-800/50 p-3">
        <p className="text-xs text-surface-500">{lang === 'zh' ? '建议' : 'Recommendation'}</p>
        <p className="mt-1 text-sm text-surface-300">{analysis.recommendation}</p>
      </div>
    </Card>
  );
}
