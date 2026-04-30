import { getDailyContent } from '@/lib/db';
import Layout from '@/components/Layout';
import DailyBrief from '@/components/DailyBrief';
import GrowthInsight from '@/components/GrowthInsight';
import LaunchRadar from '@/components/LaunchRadar';
import DailyCase from '@/components/DailyCase';

export const metadata = { title: 'Preview — Admin' };

export default async function PreviewPage() {
  const today   = new Date().toISOString().slice(0, 10);
  const content = await getDailyContent(today);

  return (
    <div>
      <div className="bg-yellow-400/10 border-b border-yellow-400/20 px-6 py-2 text-xs text-yellow-400 font-medium">
        ⚠ Preview mode — unpublished content visible
      </div>
      <Layout lang="en">
        <DailyBrief    articles={content.daily_brief}    lang="en" />
        <GrowthInsight articles={content.growth_insight} lang="en" />
        <LaunchRadar   articles={content.launch_radar}   lang="en" />
        <DailyCase     article={content.daily_case[0] ?? null} lang="en" />
      </Layout>
    </div>
  );
}
