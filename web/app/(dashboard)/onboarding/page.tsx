"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type ProductContext } from "@/lib/auth-context";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { useLang } from "@/lib/use-lang";

// AI product categories organized by AI track
const AI_CATEGORIES_EN = [
  {
    group: "AI Infrastructure",
    items: [
      { value: "llm-framework", label: "LLM Framework / SDK" },
      { value: "vector-db", label: "Vector Database" },
      { value: "mlops", label: "MLOps / Model Serving" },
      { value: "gpu-cloud", label: "GPU Cloud / Compute" },
      { value: "data-pipeline", label: "Data Pipeline / ETL" },
      { value: "ai-gateway", label: "AI Gateway / Router" },
    ],
  },
  {
    group: "AI Applications",
    items: [
      { value: "ai-chatbot", label: "AI Chatbot / Assistant" },
      { value: "ai-coding", label: "AI Coding Tool" },
      { value: "ai-writing", label: "AI Writing / Content" },
      { value: "ai-image-video", label: "AI Image / Video Generation" },
      { value: "ai-search", label: "AI Search / RAG" },
      { value: "ai-analytics", label: "AI Analytics / BI" },
    ],
  },
  {
    group: "AI for Industry",
    items: [
      { value: "ai-healthcare", label: "AI for Healthcare" },
      { value: "ai-finance", label: "AI for Finance / Fintech" },
      { value: "ai-education", label: "AI for Education" },
      { value: "ai-ecommerce", label: "AI for E-commerce" },
      { value: "ai-legal", label: "AI for Legal" },
      { value: "ai-hr", label: "AI for HR / Recruiting" },
    ],
  },
  {
    group: "AI Agents & Automation",
    items: [
      { value: "ai-agent", label: "AI Agent Platform" },
      { value: "ai-workflow", label: "AI Workflow Automation" },
      { value: "ai-rpa", label: "AI-Powered RPA" },
      { value: "ai-api", label: "AI API / Model-as-a-Service" },
    ],
  },
  {
    group: "Open Source AI",
    items: [
      { value: "open-source-model", label: "Open-Source Model" },
      { value: "open-source-tool", label: "Open-Source AI Tool" },
      { value: "open-source-framework", label: "Open-Source Framework" },
    ],
  },
];

const AI_CATEGORIES_ZH = [
  {
    group: "AI 基础设施",
    items: [
      { value: "llm-framework", label: "LLM 框架 / SDK" },
      { value: "vector-db", label: "向量数据库" },
      { value: "mlops", label: "MLOps / 模型服务" },
      { value: "gpu-cloud", label: "GPU 云 / 算力" },
      { value: "data-pipeline", label: "数据管道 / ETL" },
      { value: "ai-gateway", label: "AI 网关 / 路由" },
    ],
  },
  {
    group: "AI 应用",
    items: [
      { value: "ai-chatbot", label: "AI 聊天机器人 / 助手" },
      { value: "ai-coding", label: "AI 编程工具" },
      { value: "ai-writing", label: "AI 写作 / 内容生成" },
      { value: "ai-image-video", label: "AI 图像 / 视频生成" },
      { value: "ai-search", label: "AI 搜索 / RAG" },
      { value: "ai-analytics", label: "AI 分析 / BI" },
    ],
  },
  {
    group: "行业 AI",
    items: [
      { value: "ai-healthcare", label: "AI 医疗" },
      { value: "ai-finance", label: "AI 金融 / 金融科技" },
      { value: "ai-education", label: "AI 教育" },
      { value: "ai-ecommerce", label: "AI 电商" },
      { value: "ai-legal", label: "AI 法律" },
      { value: "ai-hr", label: "AI 人力资源 / 招聘" },
    ],
  },
  {
    group: "AI 智能体与自动化",
    items: [
      { value: "ai-agent", label: "AI 智能体平台" },
      { value: "ai-workflow", label: "AI 工作流自动化" },
      { value: "ai-rpa", label: "AI 驱动的 RPA" },
      { value: "ai-api", label: "AI API / 模型即服务" },
    ],
  },
  {
    group: "开源 AI",
    items: [
      { value: "open-source-model", label: "开源模型" },
      { value: "open-source-tool", label: "开源 AI 工具" },
      { value: "open-source-framework", label: "开源框架" },
    ],
  },
];

const STAGE_OPTIONS_EN = [
  { value: "idea", label: "Idea / Research" },
  { value: "building", label: "Building MVP" },
  { value: "beta", label: "Beta / Private Launch" },
  { value: "launched", label: "Launched / Live" },
  { value: "growing", label: "Growing (PMF found)" },
  { value: "scaling", label: "Scaling" },
];

const STAGE_OPTIONS_ZH = [
  { value: "idea", label: "创意 / 调研" },
  { value: "building", label: "开发 MVP" },
  { value: "beta", label: "内测 / 私下发布" },
  { value: "launched", label: "已上线 / 公开" },
  { value: "growing", label: "增长中（已找到 PMF）" },
  { value: "scaling", label: "规模化" },
];

const REGION_OPTIONS_EN = [
  "Global",
  "North America",
  "Europe",
  "Southeast Asia",
  "Japan",
  "Korea",
  "China / Greater China",
  "Middle East",
  "Latin America",
  "Africa",
];

const REGION_OPTIONS_ZH = [
  "全球",
  "北美",
  "欧洲",
  "东南亚",
  "日本",
  "韩国",
  "中国 / 大中华区",
  "中东",
  "拉丁美洲",
  "非洲",
];

const LANGUAGE_OPTIONS_EN = [
  { value: "en", label: "English" },
  { value: "cn", label: "Chinese" },
  { value: "both", label: "English + Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "multi", label: "Multi-language" },
];

const LANGUAGE_OPTIONS_ZH = [
  { value: "en", label: "英语" },
  { value: "cn", label: "中文" },
  { value: "both", label: "英语 + 中文" },
  { value: "ja", label: "日语" },
  { value: "ko", label: "韩语" },
  { value: "multi", label: "多语言" },
];

export default function OnboardingPage() {
  const { user, productContext, setProductContext } = useAuth();
  const router = useRouter();
  const lang = useLang();
  const isEditing = !!productContext;
  const [saved, setSaved] = useState(false);
  const [competitorInput, setCompetitorInput] = useState("");
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    name: "",
    url: "",
    oneLiner: "",
    description: "",
    category: "",
    stage: "",
    targetAudience: "",
    targetRegions: [] as string[],
    competitors: "",
    language: "en",
  });

  // Pre-fill if editing
  useEffect(() => {
    if (productContext) {
      setForm({
        name: productContext.name,
        url: productContext.url || "",
        oneLiner: productContext.oneLiner,
        description: productContext.description,
        category: productContext.category,
        stage: productContext.stage,
        targetAudience: productContext.targetAudience,
        targetRegions: productContext.targetRegions,
        competitors: productContext.competitors.join(", "),
        language: productContext.language,
      });
    }
  }, [productContext]);

  const update = (field: string, value: string | string[]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleRegion = (region: string) => {
    setForm((prev) => ({
      ...prev,
      targetRegions: prev.targetRegions.includes(region)
        ? prev.targetRegions.filter((r) => r !== region)
        : [...prev.targetRegions, region],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const now = new Date().toISOString();
    const competitors = form.competitors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const ctx: ProductContext = {
      id: productContext?.id || crypto.randomUUID(),
      userId: user!.id,
      name: form.name,
      url: form.url || undefined,
      oneLiner: form.oneLiner,
      description: form.description,
      category: form.category,
      stage: form.stage,
      targetAudience: form.targetAudience,
      targetRegions: form.targetRegions,
      competitors,
      language: form.language,
      createdAt: productContext?.createdAt || now,
      updatedAt: now,
    };
    setProductContext(ctx);

    // Also submit to the team review database (fire-and-forget)
    try {
      await fetch("/api/product-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user!.id,
          userEmail: user!.email,
          userName: user!.name,
          userUid: user!.uid,
          productName: form.name,
          productUrl: form.url || undefined,
          oneLiner: form.oneLiner,
          description: form.description,
          category: form.category,
          stage: form.stage,
          targetAudience: form.targetAudience,
          targetRegions: form.targetRegions,
          competitors,
          language: form.language,
        }),
      });
    } catch (err) {
      console.error("Failed to submit product for team review:", err);
      // Don't block the user — this is a background submission
    }

    setSaved(true);
    setTimeout(() => {
      router.push("/workspace");
    }, 1500);
  };


  const REGION_OPTIONS = lang === 'zh' ? REGION_OPTIONS_ZH : REGION_OPTIONS_EN;
  const AI_CATEGORIES = lang === 'zh' ? AI_CATEGORIES_ZH : AI_CATEGORIES_EN;
  const STAGE_OPTIONS = lang === 'zh' ? STAGE_OPTIONS_ZH : STAGE_OPTIONS_EN;
  const LANGUAGE_OPTIONS = lang === 'zh' ? LANGUAGE_OPTIONS_ZH : LANGUAGE_OPTIONS_EN;
  const isValid = form.name && form.oneLiner && form.category;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-3 py-1 mb-4">
          <Sparkles className="h-3.5 w-3.5 text-brand-500" />
          <span className="text-xs text-brand-500 font-medium">
            {isEditing
              ? (lang === 'zh' ? '编辑产品' : 'Edit Product')
              : (lang === 'zh' ? '第 1 步，共 1 步' : 'Step 1 of 1')}
          </span>
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {isEditing
            ? (lang === 'zh' ? '产品设置' : 'Product Settings')
            : (lang === 'zh' ? '告诉我们你的产品' : 'Tell us about your product')}
        </h1>
        <p className="text-surface-400 text-sm">
          {isEditing
            ? (lang === 'zh' ? '更新你的产品信息。更改将反映在所有工具中。' : 'Update your product information. Changes will be reflected across all tools.')
            : (lang === 'zh' ? '此信息为所有 WeLike 工具提供支持。一次填写，随处使用。' : 'This information powers all WeLike tools. Fill it once, use it everywhere.')}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section: Basic Info */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
            {lang === 'zh' ? '基本信息' : 'Basic Information'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                {lang === 'zh' ? '产品名称' : 'Product Name'} <span className="text-brand-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder={lang === 'zh' ? '例如：WeLike' : 'e.g. WeLike'}
                className="w-full rounded-lg border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm text-white placeholder:text-surface-600 focus-brand transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                {lang === 'zh' ? '网站 URL' : 'Website URL'} <span className="text-brand-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  value={form.url}
                  onChange={(e) => update("url", e.target.value)}
                  onBlur={async (e) => {
                    const url = e.target.value.trim();
                    if (!url) return;
                    // Only auto-fetch if oneLiner and description are empty
                    if (form.oneLiner || form.description) return;
                    setFetchingMeta(true);
                    try {
                      const res = await fetch("/api/scrape-meta", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        if (data.title && !form.oneLiner) {
                          update("oneLiner", data.title);
                        }
                        if (data.description && !form.description) {
                          update("description", data.description);
                        }
                      }
                    } catch {
                      // silently fail
                    } finally {
                      setFetchingMeta(false);
                    }
                  }}
                  placeholder="https://yourproduct.com"
                  className="w-full rounded-lg border border-surface-700 bg-surface-900 px-4 py-2.5 pr-10 text-sm text-white placeholder:text-surface-600 focus-brand transition-colors"
                />
                {fetchingMeta && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="h-4 w-4 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              {lang === 'zh' ? '一句话介绍' : 'One-liner'} <span className="text-brand-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.oneLiner}
              onChange={(e) => update("oneLiner", e.target.value)}
              placeholder={lang === 'zh' ? '用一句话描述你的产品' : 'Describe your product in one sentence'}
              maxLength={120}
              className="w-full rounded-lg border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm text-white placeholder:text-surface-600 focus-brand transition-colors"
            />
            <p className="text-xs text-surface-600 mt-1">{form.oneLiner.length}/120</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              {lang === 'zh' ? '产品描述' : 'Description'}
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder={lang === 'zh' ? '你的产品做什么？目标用户是谁？解决什么问题？' : 'What does your product do? Who is it for? What problem does it solve?'}
              className="w-full rounded-lg border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm text-white placeholder:text-surface-600 focus-brand transition-colors resize-none"
            />
          </div>
        </section>

        {/* Section: Category & Stage */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
            {lang === 'zh' ? '类别与阶段' : 'Category & Stage'}
          </h2>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              {lang === 'zh' ? 'AI 类别' : 'AI Category'} <span className="text-brand-500">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full rounded-lg border border-surface-700 bg-surface-900 px-4 py-2.5 pr-10 text-sm text-white focus-brand transition-colors appearance-none"
                style={{ colorScheme: 'dark' }}
              >
                <option value="" className="bg-surface-900 text-surface-400">{lang === 'zh' ? '选择类别...' : 'Select category...'}</option>
                {AI_CATEGORIES.map((group) => (
                  <optgroup key={group.group} label={group.group} className="bg-surface-900 text-surface-300">
                    {group.items.map((item) => (
                      <option key={item.value} value={item.value} className="bg-surface-900 text-white">
                        {item.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-4 w-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                {lang === 'zh' ? '产品阶段' : 'Product Stage'}
              </label>
              <div className="relative">
                <select
                  value={form.stage}
                  onChange={(e) => update("stage", e.target.value)}
                  className="w-full rounded-lg border border-surface-700 bg-surface-900 px-4 py-2.5 pr-10 text-sm text-white focus-brand transition-colors appearance-none"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" className="bg-surface-900 text-surface-400">{lang === 'zh' ? '选择阶段...' : 'Select stage...'}</option>
                  {STAGE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value} className="bg-surface-900 text-white">
                      {s.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-4 w-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                {lang === 'zh' ? '主要语言' : 'Primary Language'}
              </label>
              <div className="relative">
                <select
                  value={form.language}
                  onChange={(e) => update("language", e.target.value)}
                  className="w-full rounded-lg border border-surface-700 bg-surface-900 px-4 py-2.5 pr-10 text-sm text-white focus-brand transition-colors appearance-none"
                  style={{ colorScheme: 'dark' }}
                >
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l.value} value={l.value} className="bg-surface-900 text-white">
                      {l.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-4 w-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Target Market */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
            {lang === 'zh' ? '目标市场' : 'Target Market'}
          </h2>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              {lang === 'zh' ? '目标受众' : 'Target Audience'}
            </label>
            <textarea
              rows={2}
              value={form.targetAudience}
              onChange={(e) => update("targetAudience", e.target.value)}
              placeholder={lang === 'zh' ? '例如：AI 初创公司创始人、中型公司 DevOps 工程师、独立开发者...' : 'e.g. AI startup founders, DevOps engineers at mid-size companies, indie hackers...'}
              className="w-full rounded-lg border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm text-white placeholder:text-surface-600 focus-brand transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              {lang === 'zh' ? '目标区域' : 'Target Regions'}
            </label>
            <div className="flex flex-wrap gap-2">
              {REGION_OPTIONS.map((region) => {
                const isSelected = form.targetRegions.includes(region);
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => toggleRegion(region)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      isSelected
                        ? "bg-brand-500/10 border-brand-500/30 text-brand-500"
                        : "bg-surface-900 border-surface-700 text-surface-400 hover:border-surface-600 hover:text-surface-300"
                    }`}
                  >
                    {region}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              {lang === 'zh' ? '已知竞争对手' : 'Known Competitors'}
            </label>
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 focus-within:border-brand-500/50 transition-colors">
              {form.competitors.split(",").filter(Boolean).map((comp, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-md bg-surface-800 px-2.5 py-1 text-sm text-surface-200"
                >
                  {comp.trim()}
                  <button
                    type="button"
                    onClick={() => {
                      const list = form.competitors.split(",").map((c) => c.trim()).filter(Boolean);
                      list.splice(i, 1);
                      update("competitors", list.join(", "));
                    }}
                    className="text-surface-500 hover:text-white transition-colors"
                  >
                    &times;
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={competitorInput}
                onChange={(e) => setCompetitorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    const val = competitorInput.trim();
                    if (val) {
                      const list = form.competitors.split(",").map((c) => c.trim()).filter(Boolean);
                      update("competitors", [...list, val].join(", "));
                      setCompetitorInput("");
                    }
                  }
                  if (e.key === "Backspace" && competitorInput === "") {
                    const list = form.competitors.split(",").map((c) => c.trim()).filter(Boolean);
                    list.pop();
                    update("competitors", list.join(", "));
                  }
                }}
                placeholder={lang === 'zh' ? '输入公司名称后按回车' : 'Type a company name and press Enter'}
                className="min-w-[120px] flex-1 bg-transparent text-sm text-white placeholder:text-surface-600 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="pt-2 pb-12">
          {saved ? (
            <div className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-500/10 border border-brand-500/20 px-6 py-3 text-sm font-semibold text-brand-500">
              <CheckCircle className="h-4 w-4" />
              {isEditing
                ? (lang === 'zh' ? '更改已成功保存' : 'Changes saved successfully')
                : (lang === 'zh' ? '工作空间设置成功' : 'Workspace set up successfully')}
            </div>
          ) : (
            <button
              type="submit"
              disabled={!isValid}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-black hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors glow-brand"
            >
              {isEditing
                ? (lang === 'zh' ? '保存更改' : 'Save changes')
                : (lang === 'zh' ? '设置工作空间' : 'Set up workspace')}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          <p className="text-center text-xs text-surface-600 mt-3">
            {saved
              ? (lang === 'zh' ? '你可以从侧边栏探索工具。' : 'You can explore the tools from the sidebar.')
              : (lang === 'zh' ? '你随时可以从产品设置中更新此信息。' : 'You can always update this later from "Your Product Page".')}
          </p>
        </div>
      </form>
    </div>
  );
}
