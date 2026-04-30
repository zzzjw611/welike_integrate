"use client";
import { useState } from "react";
import { Search, Lightbulb, PenTool, Download, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScoutResults } from "./scout-results";
import { StrategistResults } from "./strategist-results";
import { ContentResults } from "./content-results";

interface ResultsDashboardProps {
  result: Record<string, unknown>;
  onReset: () => void;
}

const TABS = [
  { id: "scout", label: "Market Intel", icon: Search },
  { id: "strategist", label: "GTM Strategy", icon: Lightbulb },
  { id: "content", label: "Launch Content", icon: PenTool },
] as const;

export function ResultsDashboard({ result, onReset }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("scout");

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gtm-context-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scout = result.scout as Record<string, unknown> | undefined;
  const strategist = result.strategist as Record<string, unknown> | undefined;
  const contentEngine = result.contentEngine as Record<string, unknown> | undefined;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">GTM Results</h2>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-sm text-surface-400 hover:text-white bg-surface-800 hover:bg-surface-700 px-3 py-2 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" /> Download JSON
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-sm text-surface-400 hover:text-white bg-surface-800 hover:bg-surface-700 px-3 py-2 rounded-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> New Analysis
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-800 mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-brand-500 text-brand-500"
                  : "border-transparent text-surface-400 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "scout" && scout && (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <ScoutResults data={scout as any} />
        )}
        {activeTab === "strategist" && strategist && (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <StrategistResults data={strategist as any} />
        )}
        {activeTab === "content" && contentEngine && (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <ContentResults data={contentEngine as any} />
        )}
      </div>
    </div>
  );
}
