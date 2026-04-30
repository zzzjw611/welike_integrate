"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface ProductFormProps {
  onSubmit: (input: Record<string, unknown>) => void;
  disabled?: boolean;
}

export function ProductForm({ onSubmit, disabled }: ProductFormProps) {
  const { productContext } = useAuth();

  // Pre-fill from product context if available
  const [form, setForm] = useState({
    name: productContext?.name || "",
    url: productContext?.url || "",
    description: productContext?.description || productContext?.oneLiner || "",
    category: productContext?.category || "",
    stage: productContext?.stage || "",
    targetAudience: productContext?.targetAudience || "",
    language: productContext?.language || "en",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      url: form.url || undefined,
      description: form.description,
      category: form.category || undefined,
      stage: form.stage || undefined,
      targetAudience: form.targetAudience || undefined,
      language: form.language,
    });
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-1.5">
            Product Name <span className="text-brand-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. WeLike"
            className="w-full rounded-lg border border-surface-700 bg-surface-800 px-4 py-2.5 text-sm text-white placeholder:text-surface-500 focus-brand transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-1.5">
            Product URL
          </label>
          <input
            type="url"
            value={form.url}
            onChange={(e) => update("url", e.target.value)}
            placeholder="https://yourproduct.com"
            className="w-full rounded-lg border border-surface-700 bg-surface-800 px-4 py-2.5 text-sm text-white placeholder:text-surface-500 focus-brand transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-300 mb-1.5">
          Product Description <span className="text-brand-500">*</span>
        </label>
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Describe what your AI product does, who it's for, and what problem it solves..."
          className="w-full rounded-lg border border-surface-700 bg-surface-800 px-4 py-2.5 text-sm text-white placeholder:text-surface-500 focus-brand transition-colors resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-1.5">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full rounded-lg border border-surface-700 bg-surface-800 px-4 py-2.5 text-sm text-white focus-brand transition-colors"
          >
            <option value="">Select category...</option>
            <option value="AI SaaS">AI SaaS</option>
            <option value="AI DevTool">AI DevTool</option>
            <option value="AI API">AI API</option>
            <option value="AI Agent">AI Agent</option>
            <option value="Open-source AI">Open-source AI</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-1.5">
            Stage
          </label>
          <select
            value={form.stage}
            onChange={(e) => update("stage", e.target.value)}
            className="w-full rounded-lg border border-surface-700 bg-surface-800 px-4 py-2.5 text-sm text-white focus-brand transition-colors"
          >
            <option value="">Select stage...</option>
            <option value="idea">Idea / Research</option>
            <option value="building">Building MVP</option>
            <option value="beta">Beta / Private Launch</option>
            <option value="launched">Launched</option>
            <option value="growing">Growing</option>
            <option value="scaling">Scaling</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-1.5">
            Language
          </label>
          <select
            value={form.language}
            onChange={(e) => update("language", e.target.value)}
            className="w-full rounded-lg border border-surface-700 bg-surface-800 px-4 py-2.5 text-sm text-white focus-brand transition-colors"
          >
            <option value="en">English</option>
            <option value="cn">Chinese</option>
            <option value="both">Both (EN + CN)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-300 mb-1.5">
          Target Audience
        </label>
        <textarea
          rows={2}
          value={form.targetAudience}
          onChange={(e) => update("targetAudience", e.target.value)}
          placeholder="e.g. AI startup founders, technical co-founders, developer tool teams..."
          className="w-full rounded-lg border border-surface-700 bg-surface-800 px-4 py-2.5 text-sm text-white placeholder:text-surface-500 focus-brand transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={disabled || !form.name || !form.description}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-black font-semibold text-sm hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors glow-brand"
      >
        <Send className="h-4 w-4" />
        Run Full GTM Pipeline
      </button>
    </form>
  );
}
