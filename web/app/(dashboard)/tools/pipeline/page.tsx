"use client";
import { ProductForm } from "@/components/product-form";
import { PipelineProgress } from "@/components/pipeline-progress";
import { ResultsDashboard } from "@/components/results/results-dashboard";
import { usePipeline } from "@/lib/use-pipeline";
import { AlertCircle, Sparkles } from "lucide-react";

export default function PipelinePage() {
  const { state, runPipeline, reset } = usePipeline();

  return (
    <div>
      {/* Input State */}
      {state.status === "idle" && (
        <div>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-3 py-1 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-brand-500" />
              <span className="text-xs text-brand-500 font-medium">GTM Pipeline</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Generate your GTM strategy
            </h2>
            <p className="text-surface-400 text-sm">
              Three AI agents will analyze your market, build your strategy, and
              create launch content — all in one run.
            </p>
          </div>
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-8">
            <ProductForm onSubmit={runPipeline} />
          </div>
        </div>
      )}

      {/* Running State */}
      {state.status === "running" && (
        <div className="text-center pt-12">
          <h2 className="text-xl font-bold mb-2">
            Generating your GTM strategy...
          </h2>
          <p className="text-surface-400 text-sm mb-4">
            Three AI agents are working together to analyze your market, build
            your strategy, and create launch content.
          </p>
          <PipelineProgress agents={state.agents} />
          <p className="text-sm text-surface-600 mt-8">
            This usually takes 1-3 minutes. Please keep this tab open.
          </p>
        </div>
      )}

      {/* Error State */}
      {state.status === "error" && (
        <div className="max-w-xl mx-auto text-center pt-12">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8">
            <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-300 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-red-400/80 mb-6">{state.error}</p>
            <button
              onClick={reset}
              className="bg-red-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Complete State */}
      {state.status === "complete" && state.result && (
        <ResultsDashboard result={state.result} onReset={reset} />
      )}
    </div>
  );
}
