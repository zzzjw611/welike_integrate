"use client";
import { PricingResult, Domain } from "@/lib/kol-pricer/types";
import { DOMAIN_LABELS } from "@/lib/kol-pricer/constants";
import { useLang } from "@/lib/use-lang";
import Card from "./Card";

interface Props {
  pricing: PricingResult;
  domain: Domain;
}

export default function PriceCard({ pricing, domain }: Props) {
  const lang = useLang();

  return (
    <Card className="border-brand/30 bg-gradient-to-br from-brand/5 to-transparent">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-400">
          {lang === 'zh' ? '预估推文价格' : 'Estimated Tweet Price'}
        </p>
        <p className="mt-2 font-mono text-5xl font-bold text-brand">
          ${pricing.price.toLocaleString()}
        </p>
        <p className="mt-1 font-mono text-sm text-gray-500">
          {lang === 'zh' ? '范围' : 'Range'}: ${pricing.priceMin.toLocaleString()} &mdash; $
          {pricing.priceMax.toLocaleString()}
        </p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Stat label="CPM" value={`$${pricing.cpm}`} />
        <Stat
          label={lang === 'zh' ? '领域' : 'Domain'}
          value={`${DOMAIN_LABELS[domain]} / ${pricing.subDomain}`}
        />
        <Stat
          label={lang === 'zh' ? '加权展示' : 'Weighted Impressions'}
          value={pricing.weightedImpressions.toLocaleString()}
        />
        <Stat label={lang === 'zh' ? '展示/千' : 'Imp / 1000'} value={`${pricing.effectiveImpressions}`} />
        <Stat label={lang === 'zh' ? '综合评分' : 'Overall Score'} value={`${pricing.overallScore}/100`} />
        <Stat label={lang === 'zh' ? '互动率' : 'Engagement Rate'} value={`${pricing.engagementRate}%`} />
        <Stat label={lang === 'zh' ? '综合修正系数' : 'Combined Modifiers'} value={`${pricing.combinedModifiers}x`} />
        <Stat label={lang === 'zh' ? '稀缺系数' : 'Scarcity Factor'} value={`${pricing.scarcityFactor}x`} />
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-mono text-sm font-medium text-white">{value}</p>
    </div>
  );
}
