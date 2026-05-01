"use client";
import { ScoreBreakdown as ScoreBreakdownType } from "@/lib/kol-pricer/types";
import { useLang } from "@/lib/use-lang";
import ScoreBar from "./ScoreBar";
import Card from "./Card";

interface Props {
  scores: ScoreBreakdownType;
}

export default function ScoreBreakdown({ scores }: Props) {
  const lang = useLang();

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-outfit text-lg font-semibold text-white">
          {lang === 'zh' ? '评分明细' : 'Score Breakdown'}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-3xl font-bold text-brand">
            {scores.overall.toFixed(1)}
          </span>
          <span className="text-sm text-surface-500">/100</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <ScoreBar
            label={lang === 'zh' ? '影响力深度 (20%)' : 'Influence Depth (20%)'}
            score={scores.influenceDepth}
          />
          <div className="mt-1.5 grid grid-cols-2 gap-1 pl-2">
            <SubItem label={lang === 'zh' ? '粉丝数 (60%)' : 'Followers (60%)'} score={scores.followerScaleScore} />
            <SubItem label={lang === 'zh' ? '列表比例 (40%)' : 'Listed Ratio (40%)'} score={scores.listedScore} />
          </div>
        </div>

        <ScoreBar
          label={lang === 'zh' ? '粉丝质量 (40%)' : 'Follower Quality (40%)'}
          score={scores.followerQuality}
          note={lang === 'zh' ? '加权互动率' : 'Weighted ER'}
        />

        <ScoreBar
          label={lang === 'zh' ? '内容稳定性 (25%)' : 'Content Stability (25%)'}
          score={scores.contentStability}
          note={`CV ${scores.combinedCV.toFixed(2)}`}
        />

        <ScoreBar
          label={lang === 'zh' ? '互动质量 (15%)' : 'Engagement Quality (15%)'}
          score={scores.engagementQuality}
          note={`HQ ${scores.highQualityRatio.toFixed(1)}%`}
        />
      </div>
    </Card>
  );
}

function SubItem({ label, score }: { label: string; score: number }) {
  return (
    <div className="rounded-md bg-surface-800/40 px-2 py-1 text-center">
      <p className="text-[10px] text-surface-500">{label}</p>
      <p className="font-mono text-xs font-semibold text-surface-300">{score}</p>
    </div>
  );
}
