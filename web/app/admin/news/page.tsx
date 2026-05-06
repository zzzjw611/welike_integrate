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
  Send,
  FileText,
  LogIn,
  Edit3,
  X,
  Save,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";

interface NewsItem {
  date: string;
  issueNumber?: number;
  published: boolean;
  published_at: string | null;
}

interface Brief {
  title: string;
  summary: string;
  source: string;
  url: string;
  soWhat: string;
}

interface GrowthInsight {
  author: string;
  handle: string;
  platform: string;
  quote: string;
  url: string;
  commentary: string;
}

interface Launch {
  product: string;
  company: string;
  category: string;
  tag: string;
  summary: string;
  url: string;
  metric: string;
}

interface DailyCase {
  company: string;
  title: string;
  deck: string;
  metrics: string[];
}

interface IssueData {
  date: string;
  issueNumber: number;
  editor: string;
  highlight: { bullets: string[] };
  briefs: Brief[];
  growth_insights: GrowthInsight[];
  launches: Launch[];
  daily_case: DailyCase;
}

export default function AdminNewsPage() {
  const lang = useLang();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<IssueData | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [publishCountdown, setPublishCountdown] = useState(0);
  const [publishAction, setPublishAction] = useState<"publish" | "unpublish">("publish");
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [editNeedsRepublish, setEditNeedsRepublish] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/news/publish");
      if (!res.ok) throw new Error("Failed to fetch publishing status");
      const data = await res.json();

      const items: NewsItem[] = (data.data || []).map(
        (item: { date: string; published: boolean; published_at?: string }) => ({
          date: item.date,
          published: item.published,
          published_at: item.published_at || null,
        })
      );

      setNewsItems(items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load news"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    fetchNews();
  }, []);

  // Countdown and redirect after publish
  useEffect(() => {
    if (publishSuccess && publishCountdown > 0) {
      const timer = setTimeout(() => {
        setPublishCountdown(publishCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (publishSuccess && publishCountdown === 0) {
      window.location.href = "/tools/news";
    }
  }, [publishSuccess, publishCountdown]);

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

      setPublishAction(published ? "publish" : "unpublish");
      // Redirect to the archive page which reads directly from GitHub API (no Vercel deploy needed)
      window.location.href = `/tools/news/archive/${date}`;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setPublishing(null);
    }
  };

  const handlePreview = (date: string) => {
    window.open(`/tools/news/archive/${date}`, "_blank");
  };

  const handleEdit = async (date: string) => {
    setEditing(date);
    setEditLoading(true);
    try {
      const res = await fetch(`/api/news/archive/${date}`);
      if (!res.ok) throw new Error("Failed to fetch issue");
      const data = await res.json();
      const issue = data.issue;

      setEditData({
        date: issue.date,
        issueNumber: issue.issueNumber || 0,
        editor: issue.editor || "JE Labs",
        highlight: issue.highlight || { bullets: ["", "", "", ""] },
        briefs: issue.briefs || [],
        growth_insights: issue.growth_insights || [],
        launches: issue.launches || [],
        daily_case: issue.daily_case || { company: "", title: "", deck: "", metrics: [""] },
      });
    } catch (err) {
      alert("Failed to load issue for editing");
      setEditing(null);
    } finally {
      setEditLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editData) return;
    setEditSaving(true);
    try {
      const res = await fetch("/api/news/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editData.date,
          frontmatter: editData,
          body: "",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      // Check if this issue was already published
      const wasPublished = newsItems.find((item) => item.date === editData.date)?.published ?? false;

      setEditing(null);
      setEditData(null);
      setEditSuccess(editData.date);
      setEditNeedsRepublish(wasPublished);
      await fetchNews();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save edit");
    } finally {
      setEditSaving(false);
    }
  };

  const updateField = <K extends keyof IssueData>(key: K, value: IssueData[K]) => {
    if (!editData) return;
    setEditData({ ...editData, [key]: value });
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

  // ===== Edit Form Components =====

  const renderBriefEditor = (brief: Brief, index: number) => (
    <div key={index} className="bg-surface-950 rounded-xl p-4 border border-surface-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-brand-500">Brief #{index + 1}</span>
        <button
          onClick={() => {
            const briefs = editData!.briefs.filter((_, i) => i !== index);
            updateField("briefs", briefs);
          }}
          className="text-red-400 hover:text-red-300 p-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <input
        className="w-full bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
        placeholder="Title"
        value={brief.title}
        onChange={(e) => {
          const briefs = [...editData!.briefs];
          briefs[index] = { ...brief, title: e.target.value };
          updateField("briefs", briefs);
        }}
      />
      <textarea
        className="w-full bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50 resize-none"
        placeholder="Summary"
        rows={2}
        value={brief.summary}
        onChange={(e) => {
          const briefs = [...editData!.briefs];
          briefs[index] = { ...brief, summary: e.target.value };
          updateField("briefs", briefs);
        }}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          className="bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
          placeholder="Source (e.g. TechCrunch)"
          value={brief.source}
          onChange={(e) => {
            const briefs = [...editData!.briefs];
            briefs[index] = { ...brief, source: e.target.value };
            updateField("briefs", briefs);
          }}
        />
        <input
          className="bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
          placeholder="URL"
          value={brief.url}
          onChange={(e) => {
            const briefs = [...editData!.briefs];
            briefs[index] = { ...brief, url: e.target.value };
            updateField("briefs", briefs);
          }}
        />
      </div>
      <textarea
        className="w-full bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50 resize-none"
        placeholder="So What? (why this matters for marketers)"
        rows={1}
        value={brief.soWhat}
        onChange={(e) => {
          const briefs = [...editData!.briefs];
          briefs[index] = { ...brief, soWhat: e.target.value };
          updateField("briefs", briefs);
        }}
      />
    </div>
  );

  const renderInsightEditor = (insight: GrowthInsight, index: number) => (
    <div key={index} className="bg-surface-950 rounded-xl p-4 border border-surface-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-purple-500">Insight #{index + 1}</span>
        <button
          onClick={() => {
            const insights = editData!.growth_insights.filter((_, i) => i !== index);
            updateField("growth_insights", insights);
          }}
          className="text-red-400 hover:text-red-300 p-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <input
          className="bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
          placeholder="Author"
          value={insight.author}
          onChange={(e) => {
            const insights = [...editData!.growth_insights];
            insights[index] = { ...insight, author: e.target.value };
            updateField("growth_insights", insights);
          }}
        />
        <input
          className="bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
          placeholder="Handle (e.g. @handle)"
          value={insight.handle}
          onChange={(e) => {
            const insights = [...editData!.growth_insights];
            insights[index] = { ...insight, handle: e.target.value };
            updateField("growth_insights", insights);
          }}
        />
        <input
          className="bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
          placeholder="Platform"
          value={insight.platform}
          onChange={(e) => {
            const insights = [...editData!.growth_insights];
            insights[index] = { ...insight, platform: e.target.value };
            updateField("growth_insights", insights);
          }}
        />
      </div>
      <textarea
        className="w-full bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50 resize-none"
        placeholder="Quote"
        rows={3}
        value={insight.quote}
        onChange={(e) => {
          const insights = [...editData!.growth_insights];
          insights[index] = { ...insight, quote: e.target.value };
          updateField("growth_insights", insights);
        }}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          className="bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
          placeholder="URL"
          value={insight.url}
          onChange={(e) => {
            const insights = [...editData!.growth_insights];
            insights[index] = { ...insight, url: e.target.value };
            updateField("growth_insights", insights);
          }}
        />
        <input
          className="bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
          placeholder="Commentary"
          value={insight.commentary}
          onChange={(e) => {
            const insights = [...editData!.growth_insights];
            insights[index] = { ...insight, commentary: e.target.value };
            updateField("growth_insights", insights);
          }}
        />
      </div>
    </div>
  );

  const renderLaunchEditor = (launch: Launch, index: number) => (
    <div key={index} className="bg-surface-950 rounded-xl p-4 border border-surface-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-orange-500">Launch #{index + 1}</span>
        <button
          onClick={() => {
            const launches = editData!.launches.filter((_, i) => i !== index);
            updateField("launches", launches);
          }}
          className="text-red-400 hover:text-red-300 p-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          className="bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
          placeholder="Product name"
          value={launch.product}
          onChange={(e) => {
            const launches = [...editData!.launches];
            launches[index] = { ...launch, product: e.target.value };
            updateField("launches", launches);
          }}
        />
        <input
          className="bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
          placeholder="Company"
          value={launch.company}
          onChange={(e) => {
            const launches = [...editData!.launches];
            launches[index] = { ...launch, company: e.target.value };
            updateField("launches", launches);
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          className="bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
          placeholder="Category"
          value={launch.category}
          onChange={(e) => {
            const launches = [...editData!.launches];
            launches[index] = { ...launch, category: e.target.value };
            updateField("launches", launches);
          }}
        />
        <input
          className="bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
          placeholder="Tag (Rising / Big AI / Funded)"
          value={launch.tag}
          onChange={(e) => {
            const launches = [...editData!.launches];
            launches[index] = { ...launch, tag: e.target.value };
            updateField("launches", launches);
          }}
        />
      </div>
      <textarea
        className="w-full bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50 resize-none"
        placeholder="Summary"
        rows={2}
        value={launch.summary}
        onChange={(e) => {
          const launches = [...editData!.launches];
          launches[index] = { ...launch, summary: e.target.value };
          updateField("launches", launches);
        }}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          className="bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
          placeholder="URL"
          value={launch.url}
          onChange={(e) => {
            const launches = [...editData!.launches];
            launches[index] = { ...launch, url: e.target.value };
            updateField("launches", launches);
          }}
        />
        <input
          className="bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
          placeholder="Metric (e.g. 500+ upvotes)"
          value={launch.metric}
          onChange={(e) => {
            const launches = [...editData!.launches];
            launches[index] = { ...launch, metric: e.target.value };
            updateField("launches", launches);
          }}
        />
      </div>
    </div>
  );

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
                          ? `${lang === "zh" ? "发布于" : "Published at"}: ${new Date(item.published_at).toLocaleString()}`
                          : lang === "zh" ? "等待审核发布" : "Awaiting review"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <button
                      onClick={() => handleEdit(item.date)}
                      className="inline-flex items-center gap-1.5 text-xs text-surface-400 hover:text-white bg-surface-800 hover:bg-surface-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      {lang === "zh" ? "编辑" : "Edit"}
                    </button>
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
                        {publishing === item.date ? "..." : lang === "zh" ? "撤回" : "Unpublish"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePublish(item.date, true)}
                        disabled={publishing === item.date}
                        className="inline-flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {publishing === item.date ? "..." : lang === "zh" ? "发布" : "Publish"}
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Publish / Unpublish Toast */}
      {publishSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8 mx-4 shadow-2xl text-center max-w-sm">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 ${publishAction === "publish" ? "bg-green-500/20" : "bg-yellow-500/20"}`}>
              <CheckCircle className={`h-8 w-8 ${publishAction === "publish" ? "text-green-400" : "text-yellow-400"}`} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {publishAction === "publish"
                ? (lang === "zh" ? "发布成功！" : "Publish Success!")
                : (lang === "zh" ? "已撤回！" : "Unpublished!")}
            </h3>
            <p className="text-sm text-surface-400 mb-6">
              {publishAction === "publish"
                ? (lang === "zh"
                    ? `即将跳转到 AI News 页面... (${publishCountdown}s)`
                    : `Redirecting to AI News page... (${publishCountdown}s)`)
                : (lang === "zh"
                    ? "新闻已撤回，网站更新后将不再显示。"
                    : "News has been unpublished. It will no longer show on the website after the next deploy.")}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => { setPublishSuccess(null); setPublishCountdown(0); }}
                className="inline-flex items-center gap-2 text-sm text-surface-300 hover:text-white bg-surface-800 hover:bg-surface-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                {lang === "zh" ? "继续编辑" : "Continue Editing"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Success Toast */}
      {editSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8 mx-4 shadow-2xl text-center max-w-sm">
            <div className="h-16 w-16 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-brand-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {lang === "zh" ? "保存成功！" : "Saved Successfully!"}
            </h3>
            <p className="text-sm text-surface-400 mb-6">
              {editNeedsRepublish
                ? (lang === "zh"
                    ? "编辑已保存。点击重新发布以更新网站。"
                    : "Changes saved. Click Republish to update the website.")
                : (lang === "zh"
                    ? "编辑已保存到 GitHub，预览将显示最新版本"
                    : "Changes saved to GitHub. Preview will show the latest version.")}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setEditSuccess(null)}
                className="inline-flex items-center gap-2 text-sm text-surface-300 hover:text-white bg-surface-800 hover:bg-surface-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                {lang === "zh" ? "继续编辑" : "Continue Editing"}
              </button>
              <button
                onClick={() => { setEditSuccess(null); window.open(`/tools/news/archive/${editSuccess}`, "_blank"); }}
                className="inline-flex items-center gap-2 text-sm text-white bg-brand-500 hover:bg-brand-400 px-4 py-2 rounded-lg transition-colors"
              >
                <Eye className="h-4 w-4" />
                {lang === "zh" ? "预览" : "Preview"}
              </button>
              {editNeedsRepublish && (
                <button
                  onClick={() => {
                    setEditSuccess(null);
                    handlePublish(editSuccess, true);
                  }}
                  className="inline-flex items-center gap-2 text-sm text-white bg-green-500 hover:bg-green-400 px-4 py-2 rounded-lg transition-colors"
                >
                  <Send className="h-4 w-4" />
                  {lang === "zh" ? "重新发布" : "Republish"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
              <h2 className="text-lg font-semibold text-white">
                {lang === "zh" ? "编辑新闻" : "Edit News"} — {editData.date}
              </h2>
              <button
                onClick={() => { setEditing(null); setEditData(null); }}
                className="text-surface-500 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {editLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Issue Number & Editor */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-surface-500 mb-1.5">
                        {lang === "zh" ? "期号" : "Issue Number"}
                      </label>
                      <input
                        className="w-full bg-surface-950 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
                        type="number"
                        value={editData.issueNumber}
                        onChange={(e) => updateField("issueNumber", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-500 mb-1.5">
                        {lang === "zh" ? "编辑" : "Editor"}
                      </label>
                      <input
                        className="w-full bg-surface-950 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
                        value={editData.editor}
                        onChange={(e) => updateField("editor", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Highlights */}
                  <div>
                    <label className="block text-xs font-medium text-surface-500 mb-1.5">
                      {lang === "zh" ? "高亮摘要" : "Highlights"}
                    </label>
                    <div className="space-y-2">
                      {editData.highlight.bullets.map((bullet, i) => (
                        <input
                          key={i}
                          className="w-full bg-surface-950 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
                          value={bullet}
                          onChange={(e) => {
                            const bullets = [...editData.highlight.bullets];
                            bullets[i] = e.target.value;
                            updateField("highlight", { bullets });
                          }}
                          placeholder={`Highlight ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Briefs */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-surface-500">
                        {lang === "zh" ? "新闻简报" : "Briefs"}
                      </label>
                      <button
                        onClick={() => {
                          const briefs = [...editData.briefs, { title: "", summary: "", source: "", url: "", soWhat: "" }];
                          updateField("briefs", briefs);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400"
                      >
                        <Plus className="h-3 w-3" />
                        {lang === "zh" ? "添加" : "Add"}
                      </button>
                    </div>
                    <div className="space-y-3">
                      {editData.briefs.map((brief, i) => renderBriefEditor(brief, i))}
                    </div>
                  </div>

                  {/* Growth Insights */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-surface-500">
                        {lang === "zh" ? "专家观点" : "Growth Insights"}
                      </label>
                      <button
                        onClick={() => {
                          const insights = [...editData.growth_insights, { author: "", handle: "", platform: "", quote: "", url: "", commentary: "" }];
                          updateField("growth_insights", insights);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400"
                      >
                        <Plus className="h-3 w-3" />
                        {lang === "zh" ? "添加" : "Add"}
                      </button>
                    </div>
                    <div className="space-y-3">
                      {editData.growth_insights.map((insight, i) => renderInsightEditor(insight, i))}
                    </div>
                  </div>

                  {/* Launches */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-surface-500">
                        {lang === "zh" ? "产品发布" : "Launches"}
                      </label>
                      <button
                        onClick={() => {
                          const launches = [...editData.launches, { product: "", company: "", category: "", tag: "Rising", summary: "", url: "", metric: "" }];
                          updateField("launches", launches);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400"
                      >
                        <Plus className="h-3 w-3" />
                        {lang === "zh" ? "添加" : "Add"}
                      </button>
                    </div>
                    <div className="space-y-3">
                      {editData.launches.map((launch, i) => renderLaunchEditor(launch, i))}
                    </div>
                  </div>

                  {/* Daily Case */}
                  <div>
                    <label className="block text-xs font-medium text-surface-500 mb-2">
                      {lang === "zh" ? "案例研究" : "Daily Case"}
                    </label>
                    <div className="bg-surface-950 rounded-xl p-4 border border-surface-800 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          className="bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
                          placeholder="Company"
                          value={editData.daily_case.company}
                          onChange={(e) => updateField("daily_case", { ...editData.daily_case, company: e.target.value })}
                        />
                        <input
                          className="bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
                          placeholder="Title"
                          value={editData.daily_case.title}
                          onChange={(e) => updateField("daily_case", { ...editData.daily_case, title: e.target.value })}
                        />
                      </div>
                      <textarea
                        className="w-full bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50 resize-none"
                        placeholder="Deck (2-3 sentence overview)"
                        rows={2}
                        value={editData.daily_case.deck}
                        onChange={(e) => updateField("daily_case", { ...editData.daily_case, deck: e.target.value })}
                      />
                      <div>
                        <label className="block text-xs font-medium text-surface-500 mb-1.5 mt-3">
                          {lang === "zh" ? "关键指标" : "Metrics"}
                        </label>
                        <div className="space-y-2">
                          {(editData.daily_case.metrics || [""]).map((metric, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input
                                className="flex-1 bg-surface-900 text-white text-sm border border-surface-700 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500/50"
                                value={metric}
                                onChange={(e) => {
                                  const metrics = [...(editData.daily_case.metrics || [""])];
                                  metrics[i] = e.target.value;
                                  updateField("daily_case", { ...editData.daily_case, metrics });
                                }}
                                placeholder={`Metric ${i + 1}`}
                              />
                              <button
                                onClick={() => {
                                  const metrics = editData.daily_case.metrics?.filter((_, j) => j !== i) || [];
                                  updateField("daily_case", { ...editData.daily_case, metrics });
                                }}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const metrics = [...(editData.daily_case.metrics || []), ""];
                              updateField("daily_case", { ...editData.daily_case, metrics });
                            }}
                            className="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400"
                          >
                            <Plus className="h-3 w-3" />
                            {lang === "zh" ? "添加指标" : "Add Metric"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-800">
              <button
                onClick={() => { setEditing(null); setEditData(null); }}
                className="text-sm text-surface-400 hover:text-white bg-surface-800 hover:bg-surface-700 px-4 py-2 rounded-lg transition-colors"
              >
                {lang === "zh" ? "取消" : "Cancel"}
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="inline-flex items-center gap-2 text-sm text-white bg-brand-500 hover:bg-brand-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {editSaving ? "..." : lang === "zh" ? "保存" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
