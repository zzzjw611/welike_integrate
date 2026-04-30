"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/use-lang";
import {
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Globe,
  Users,
  Tag,
  Clock,
  Layers,
} from "lucide-react";

interface Submission {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  user_uid: string | null;
  product_name: string;
  product_url: string | null;
  one_liner: string;
  description: string;
  category: string;
  stage: string;
  target_audience: string;
  target_regions: string[];
  competitors: string[];
  language: string;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminSubmissionsPage() {
  const lang = useLang();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchSubmissions = async (pageNum: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/product-submissions?page=${pageNum}&limit=20`
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch");
      }
      const data = await res.json();
      setSubmissions(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load submissions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(page);
  }, [page]);

  const filtered = submissions.filter(
    (s) =>
      s.product_name.toLowerCase().includes(search.toLowerCase()) ||
      s.one_liner.toLowerCase().includes(search.toLowerCase()) ||
      (s.user_email &&
        s.user_email.toLowerCase().includes(search.toLowerCase())) ||
      (s.user_name &&
        s.user_name.toLowerCase().includes(search.toLowerCase()))
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      idea: "bg-yellow-500/10 text-yellow-400",
      building: "bg-blue-500/10 text-blue-400",
      beta: "bg-purple-500/10 text-purple-400",
      launched: "bg-green-500/10 text-green-400",
      growing: "bg-brand-500/10 text-brand-500",
      scaling: "bg-orange-500/10 text-orange-400",
    };
    return colors[stage] || "bg-surface-800 text-surface-400";
  };

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Header */}
      <div className="border-b border-surface-800">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-2xl font-bold">
                {lang === "zh" ? "产品提交管理" : "Product Submissions"}
              </h1>
              <p className="text-sm text-surface-500 mt-1">
                {lang === "zh"
                  ? "查看所有用户提交的产品信息"
                  : "Review all user-submitted product information"}
              </p>
            </div>
            {pagination && (
              <div className="text-sm text-surface-500">
                {lang === "zh" ? `共 ${pagination.total} 条` : `${pagination.total} total`}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative mt-4 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                lang === "zh" ? "搜索产品名称、用户邮箱..." : "Search product name, email..."
              }
              className="w-full rounded-lg border border-surface-700 bg-surface-900 pl-10 pr-4 py-2 text-sm text-white placeholder:text-surface-600 focus:border-brand-500/50 transition-colors outline-none"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-6">
        {loading && submissions.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-surface-500 text-sm">
              {search
                ? lang === "zh"
                  ? "没有匹配的提交记录"
                  : "No matching submissions"
                : lang === "zh"
                ? "暂无提交记录"
                : "No submissions yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((submission) => (
              <div
                key={submission.id}
                className="rounded-xl border border-surface-800 bg-surface-900 overflow-hidden hover:border-surface-700 transition-colors"
              >
                {/* Card Header */}
                <button
                  onClick={() =>
                    setExpandedId(
                      expandedId === submission.id ? null : submission.id
                    )
                  }
                  className="w-full flex items-start justify-between p-5 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-semibold text-white truncate">
                        {submission.product_name}
                      </h3>
                      {submission.stage && (
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getStageColor(
                            submission.stage
                          )}`}
                        >
                          {submission.stage}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-surface-400 line-clamp-1">
                      {submission.one_liner}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-surface-500">
                      {submission.user_email && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {submission.user_email}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(submission.created_at)}
                      </span>
                      {submission.category && (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {submission.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {expandedId === submission.id ? (
                      <ChevronUp className="h-5 w-5 text-surface-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-surface-500" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedId === submission.id && (
                  <div className="border-t border-surface-800 px-5 py-4 space-y-4">
                    {/* Description */}
                    {submission.description && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-1">
                          {lang === "zh" ? "产品描述" : "Description"}
                        </p>
                        <p className="text-sm text-surface-300 leading-relaxed">
                          {submission.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {/* Category */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-1">
                          {lang === "zh" ? "类别" : "Category"}
                        </p>
                        <p className="text-sm text-surface-300">
                          {submission.category}
                        </p>
                      </div>

                      {/* Stage */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-1">
                          {lang === "zh" ? "阶段" : "Stage"}
                        </p>
                        <p className="text-sm text-surface-300">
                          {submission.stage || "-"}
                        </p>
                      </div>

                      {/* Target Audience */}
                      {submission.target_audience && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-1">
                            {lang === "zh" ? "目标受众" : "Target Audience"}
                          </p>
                          <p className="text-sm text-surface-300">
                            {submission.target_audience}
                          </p>
                        </div>
                      )}

                      {/* Language */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-1">
                          {lang === "zh" ? "语言" : "Language"}
                        </p>
                        <p className="text-sm text-surface-300">
                          {submission.language}
                        </p>
                      </div>
                    </div>

                    {/* Target Regions */}
                    {submission.target_regions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-2">
                          <Globe className="h-3 w-3 inline mr-1" />
                          {lang === "zh" ? "目标区域" : "Target Regions"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {submission.target_regions.map((region) => (
                            <span
                              key={region}
                              className="text-xs bg-surface-800 text-surface-300 px-2 py-1 rounded-md"
                            >
                              {region}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Competitors */}
                    {submission.competitors.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-2">
                          <Layers className="h-3 w-3 inline mr-1" />
                          {lang === "zh" ? "竞争对手" : "Competitors"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {submission.competitors.map((comp) => (
                            <span
                              key={comp}
                              className="text-xs bg-surface-800 text-surface-300 px-2 py-1 rounded-md"
                            >
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Links */}
                    <div className="flex items-center gap-3 pt-2">
                      {submission.product_url && (
                        <a
                          href={submission.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-400 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {submission.product_url}
                        </a>
                      )}
                      {submission.user_uid && (
                        <span className="text-xs text-surface-600">
                          UID: {submission.user_uid}
                        </span>
                      )}
                      {submission.user_id && (
                        <span className="text-xs text-surface-600">
                          User ID: {submission.user_id.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-sm text-surface-400 hover:text-white bg-surface-900 border border-surface-800 hover:border-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {lang === "zh" ? "上一页" : "Previous"}
            </button>
            <span className="text-sm text-surface-500 px-3">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page === pagination.totalPages}
              className="px-3 py-1.5 rounded-lg text-sm text-surface-400 hover:text-white bg-surface-900 border border-surface-800 hover:border-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {lang === "zh" ? "下一页" : "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
