"use client";
import { AnalysisResult } from "@/lib/kol-pricer/types";
import { DOMAIN_LABELS } from "@/lib/kol-pricer/constants";
import { useLang } from "@/lib/use-lang";

interface Props {
  result: AnalysisResult;
}

export default function DataSummary({ result }: Props) {
  const lang = useLang();
  const { user, scores, pricing } = result;

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Profile */}
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 overflow-hidden rounded-full bg-gray-800">
            {user.profile_image_url ? (
              <img
                src={user.profile_image_url}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-gray-500">
                {user.name?.charAt(0) || "?"}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-sm text-gray-500">@{user.username}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <Stat
            label={lang === 'zh' ? '粉丝' : 'Followers'}
            value={user.public_metrics.followers_count.toLocaleString()}
          />
          <Stat
            label={lang === 'zh' ? '关注' : 'Following'}
            value={user.public_metrics.following_count.toLocaleString()}
          />
          <Stat
            label={lang === 'zh' ? '列表' : 'Listed'}
            value={user.public_metrics.listed_count.toLocaleString()}
          />
          <Stat
            label={lang === 'zh' ? '获取/评分' : 'Fetched / Scored'}
            value={`${result.tweets.length} / ${result.trimmedTweets.length}`}
          />
        </div>
      </div>

      {/* V2 Analytics */}
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
        <Stat
          label={lang === 'zh' ? '领域' : 'Domain'}
          value={`${DOMAIN_LABELS[result.domain]} / ${pricing.subDomain}`}
        />
        <Stat
          label={lang === 'zh' ? '加权展示' : 'Weighted Imp'}
          value={pricing.weightedImpressions.toLocaleString()}
          note={lang === 'zh' ? '时间衰减平均' : 'time-decay avg'}
        />
        <Stat
          label={lang === 'zh' ? '高质量互动' : 'HQ Interaction'}
          value={`${scores.highQualityRatio.toFixed(1)}%`}
          note={lang === 'zh' ? '回复+转发+引用+书签' : 'replies+RT+Q+BM'}
        />
        <Stat
          label={lang === 'zh' ? '加权互动' : 'Weighted Eng'}
          value={pricing.weightedEngagement.toLocaleString()}
          note={lang === 'zh' ? '每条推文平均' : 'per tweet avg'}
        />
        <Stat
          label={lang === 'zh' ? '广告比例' : 'Ad Ratio'}
          value={`${pricing.adRatio}%`}
          note={lang === 'zh' ? '赞助内容' : 'sponsored'}
        />
        <Stat
          label={lang === 'zh' ? '稀缺性' : 'Scarcity'}
          value={`${pricing.scarcityFactor}x`}
          note={pricing.scarcityFactor >= 1.15 ? (lang === 'zh' ? '非常稀缺' : 'very scarce') : lang === 'zh' ? '一般' : 'normal'}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-mono text-sm font-medium text-white">{value}</p>
      {note && <p className="text-[10px] text-gray-600">{note}</p>}
    </div>
  );
}
