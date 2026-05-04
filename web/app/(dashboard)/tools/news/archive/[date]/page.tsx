import { notFound } from "next/navigation";
import {
  getIssueByDate,
  getAdjacentIssues,
  getPreviousIssueSummaries,
  listIssues,
} from "@/lib/ai-marketer-news";
import Masthead from "@/components/ai-marketer-news/Masthead";
import HighlightSummary from "@/components/ai-marketer-news/HighlightSummary";
import DailyBrief from "@/components/ai-marketer-news/DailyBrief";
import GrowthInsightSection from "@/components/ai-marketer-news/GrowthInsight";
import LaunchRadar from "@/components/ai-marketer-news/LaunchRadar";
import DailyCaseSection from "@/components/ai-marketer-news/DailyCase";
import IssueSwitcher from "@/components/ai-marketer-news/IssueSwitcher";
import PastIssues from "@/components/ai-marketer-news/PastIssues";
import Footer from "@/components/ai-marketer-news/Footer";
import BackToTop from "@/components/ai-marketer-news/BackToTop";

export async function generateStaticParams() {
  const dates = await listIssues();
  return dates.map((date) => ({ date }));
}

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const issue = await getIssueByDate(date);
  if (!issue) notFound();

  const { prev, next } = await getAdjacentIssues(date);
  const issues = await listIssues();
  const isLatest = issues.length > 0 && issues[0] === date;
  const pastSummaries = await getPreviousIssueSummaries(date, 6);

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse 900px 600px at 10% 0%,rgba(0,245,160,.055) 0%,transparent 65%),radial-gradient(ellipse 700px 500px at 90% 100%,rgba(90,171,255,.05) 0%,transparent 60%),#07090d",
      }}
    >
      <div className="mx-auto max-w-4xl px-5 sm:px-8 py-10 sm:py-14">
        <IssueSwitcher
          current={date}
          prev={prev}
          next={next}
          isLatest={isLatest}
        />

        <Masthead
          date={issue.date}
          issueNumber={issue.issueNumber}
          editor={issue.editor}
        />

        <HighlightSummary highlight={issue.highlight} />

        <DailyBrief items={issue.briefs} />

        <GrowthInsightSection items={issue.growth_insights} />

        <LaunchRadar items={issue.launches} />

        <DailyCaseSection caseItem={issue.daily_case} />

        <PastIssues issues={pastSummaries} />

        <Footer />
      </div>

      <BackToTop />
    </div>
  );
}
