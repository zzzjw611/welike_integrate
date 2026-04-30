"use client";
import { PricingResult, Domain, ClaudeAnalysis, IdentityTag } from "@/lib/kol-pricer/types";
import { DOMAIN_LABELS } from "@/lib/kol-pricer/constants";
import { useLang } from "@/lib/use-lang";
import Card from "./Card";

const IDENTITY_TAG_ZH: Record<IdentityTag, string> = {
  "Builder": "创始人",
  "KOL": "关键意见领袖",
  "Content Creator": "内容创作者",
};

interface Props {
  pricing: PricingResult;
  domain: Domain;
  claudeAnalysis: ClaudeAnalysis;
}

export default function FormulaCard({ pricing, domain, claudeAnalysis }: Props) {
  const lang = useLang();
  const isBuilder = claudeAnalysis.identityTags.includes("Builder");
  const isKOL = claudeAnalysis.identityTags.includes("KOL");
  const identityTag: IdentityTag = isBuilder ? "Builder" : isKOL ? "KOL" : "Content Creator";
  const identityLabel = lang === 'zh' ? IDENTITY_TAG_ZH[identityTag] : identityTag;

  return (
    <Card>
      <h3 className="mb-4 font-outfit text-lg font-semibold text-white">
        {lang === 'zh' ? '定价公式' : 'Pricing Formula'}
      </h3>
      <div className="space-y-2 font-mono text-sm">
        <div className="flex justify-between text-gray-400">
          <span>CPM = $5 + ({pricing.overallScore}/100) × $55</span>
          <span className="text-white">${pricing.cpm}</span>
        </div>

        <div className="flex justify-between text-gray-400">
          <span>{lang === 'zh' ? '加权展示 / 千' : 'Weighted Imp / 1000'}</span>
          <span className="text-white">
            {pricing.weightedImpressions.toLocaleString()} →{" "}
            {pricing.effectiveImpressions}
          </span>
        </div>

        <div className="mt-1 rounded-lg border border-gray-700/50 bg-gray-800/30 px-3 py-2">
          <div className="mb-2 flex justify-between text-gray-300">
            <span className="font-semibold">{lang === 'zh' ? '修正系数' : 'Modifiers'}</span>
            <span className="font-semibold text-white">
              {pricing.combinedModifiers}x
            </span>
          </div>
          <div className="space-y-1 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>
                {lang === 'zh' ? '领域' : 'Domain'} ({DOMAIN_LABELS[domain]} / {pricing.subDomain})
              </span>
              <span>{pricing.domainMultiplier}x</span>
            </div>
            <div className="flex justify-between">
              <span>{lang === 'zh' ? '可信度' : 'Credibility'}</span>
              <span>{pricing.credibilityMultiplier}x</span>
            </div>
            <div className="flex justify-between">
              <span>{lang === 'zh' ? '相关性' : 'Relevance'}</span>
              <span>{pricing.relevanceMultiplier}x</span>
            </div>
            <div className="flex justify-between">
              <span>{lang === 'zh' ? '身份' : 'Identity'} ({identityLabel})</span>
              <span>{pricing.identityMultiplier}x</span>
            </div>
            <div className="flex justify-between">
              <span>
                {lang === 'zh' ? '稀缺性 (广告比例' : 'Scarcity (ad ratio'}: {pricing.adRatio}%)
              </span>
              <span
                className={
                  pricing.scarcityFactor >= 1.15
                    ? "text-green-400"
                    : pricing.scarcityFactor <= 0.85
                      ? "text-red-400"
                      : "text-gray-400"
                }
              >
                {pricing.scarcityFactor}x
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-2">
          <div className="flex justify-between font-semibold">
            <span className="text-gray-300">
              {lang === 'zh' ? '价格' : 'Price'} = CPM × Eff.Imp × {pricing.combinedModifiers}x
            </span>
            <span className="text-brand">
              ${pricing.price.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>{lang === 'zh' ? '范围 (±20%)' : 'Range (±20%)'}</span>
            <span>
              ${pricing.priceMin.toLocaleString()} ~{" "}
              ${pricing.priceMax.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
