"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/use-lang";
import { useAuth } from "@/lib/auth-context";
import {
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Send,
  FileText,
  LogIn,
} from "lucide-react";

interface NewsItem {
  date: string;
  issueNumber?: number;
  published: boolean;
  published_at: string | null;
  title?: string;
  briefCount?: number;
}

export default function AdminNewsPage() {
  const lang = useLang();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState<string | null>(null);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="text-center">
          <LogIn className="h-12 w-12 text-surface-700 mx-auto mb-3" />
          <p className="text-surface-500 text-sm mb-4">
            {lang === "zh" ? "请先登录" : "Please log in first"}
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-brand-500 hover:text-brand-400 bg-brand-500/10 px-4 py-2 rounded-lg transition-colors"
          >
            <LogIn className="h-4 w-4" />
            {lang === "zh" ? "去登录" : "Go to Login"}
          </a>
        </div>
      </div>
    );
  }

  const fetchNews = async () => {
    setLoading(true);
    setError("");
    try {
      // Get all publishing statuses
      const pubRes = await fetch("/api/news/publish");
      if (!pubRes.ok) throw new Error("Failed to fetch publishing status");
      const pubData = await pubRes.json();

      // Get all file dates
      const filesRes = await fetch("/api/news/archive");
      if (!filesRes.ok) throw new Error("Failed to fetch news files");
      const filesData = await filesRes.json();

      // Merge: for each file date, check if it has a publishing record
      const merged: NewsItem[] = (filesData.issues || []).map(
        (date: string) => {
          const pub = (pubData.data || []).find(
            (p: any) => p.date === date
          );
          return {
            date,
            published: pub ? pub.published : false,
            published_at: pub ? pub.published_at : null,
          };
        }
      );

      setNewsItems(merged);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load news"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handlePublish = async (date: string, published: boolean) => {
    setPublishing(date);
    try {
      const res = await fetch("/api/news/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, published }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to publish");
      }

      // Refresh the list
      await fetchNews();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to publish"
      );
    } finally {
      setPublishing(null);
    }
  };

  const handlePreview = async (date: string) => {
    if (expandedDate === date) {
      setExpandedDate(null);
      setPreviewContent("");
      return;
    }

    setExpandedDate(date);
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/news/archive/${date}`);
      if (!res.ok) throw new Error("Failed to fetch issue");
      const data = await res.json();
      setPreviewContent(
        data.issue
          ? `#${data.issue.issueNumber || "?"} - ${data.issue.date}\n\n` +
            `Briefs: ${(data.issue.briefs || []).length}\n` +
            `Insights: ${(data.issue.growth_insights || []).length}\n` +
            `Launches: ${(data.issue.launches || []).length}\n` +
            `Case: ${data.issue.daily_case?.company || "N/A"}`
          : "No content"
      );
    } catch (err) {
      setPreviewContent("Failed to load preview");
    } finally {
      setPreviewLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00Z");
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Header */}
      <div className="border-b border-surface-800">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-2xl font-bold">
                {lang === "zh" ? "AI 新闻管理" : "AI News Management"}
              </h1>
              <p className="text-sm text-surface-500 mt-1">
                {lang === "zh"
                  ? "审核、编辑和发布 AI 新闻"
                  : "Review, edit, and publish AI news issues"}
              </p>
            </div>
            <button
              onClick={fetchNews}
              className="text-sm text-surface-400 hover:text-white bg-surface-900 border border-surface-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              {lang === "zh" ? "刷新" : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          </div>
        ) : newsItems.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-12 w-12 text-surface-700 mx-auto mb-3" />
            <p className="text-surface-500 text-sm">
              {lang === "zh"
                ? "暂无新闻，等待自动生成..."
                : "No news yet, waiting for auto-generation..."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {newsItems.map((item) => (
              <div
                key={item.date}
                className="rounded-xl border border-surface-800 bg-surface-900 overflow-hidden hover:border-surface-700 transition-colors"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                        item.published
                          ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                          : "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.3)]"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-white">
                          {formatDate(item.date)}
                        </h3>
                        {item.published ? (
                          <span className="text-[11px] font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {lang === "zh" ? "已发布" : "Published"}
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lang === "zh" ? "草稿" : "Draft"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-surface-500 mt-0.5">
                        {item.published_at
                          ? `${lang === "zh" ? "发布于" : "Published at"}: ${new Date(
                              item.published_at
                            ).toLocaleString()}`
                          : lang === "zh"
                          ? "等待审核发布"
                          : "Awaiting review"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <button
                      onClick={() => handlePreview(item.date)}
                      className="inline-flex items-center gap-1.5 text-xs text-surface-400 hover:text-white bg-surface-800 hover:bg-surface-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {lang === "zh" ? "预览" : "Preview"}
                    </button>

                    {item.published ? (
                      <button
                        onClick={() => handlePublish(item.date, false)}
                        disabled={publishing === item.date}
                        className="inline-flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <EyeOff className="h-3.5 w-3.5" />
                        {publishing === item.date
                          ? "..."
                          : lang === "zh"
                          ? "撤回"
                          : "Unpublish"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePublish(item.date, true)}
                        disabled={publishing === item.date}
                        className="inline-flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {publishing === item.date
                          ? "..."
                          : lang === "zh"
                          ? "发布"
                          : "Publish"}
                      </button>
                    )}

                    <a
                      href={`/tools/news/archive/${item.date}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-300 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                {/* Preview Content */}
                {expandedDate === item.date && (
                  <div className="border-t border-surface-800 px-5 py-4">
                    {previewLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <pre className="text-sm text-surface-300 whitespace-pre-wrap font-mono bg-surface-950 rounded-lg p-4 border border-surface-800">
                        {previewContent}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
