"use client";
import { Search, Lightbulb, PenTool, Check, Loader2 } from "lucide-react";
import type { AgentStatus } from "@/lib/use-pipeline";
import { cn } from "@/lib/utils";

interface PipelineProgressProps {
  agents: Record<string, AgentStatus>;
}

const AGENT_META: {
  name: string;
  role: string;
  icon: React.ElementType;
}[] = [
  { name: "Scout", role: "Market & Competitive Intelligence", icon: Search },
  { name: "Strategist", role: "Launch & GTM Planning", icon: Lightbulb },
  { name: "Content Engine", role: "Multi-Platform Content", icon: PenTool },
];

export function PipelineProgress({ agents }: PipelineProgressProps) {
  return (
    <div className="py-8">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {AGENT_META.map((agent, i) => {
          const status = agents[agent.name] || "pending";
          const Icon = agent.icon;

          return (
            <div key={agent.name} className="flex items-center flex-1">
              <div className="flex flex-col items-center text-center flex-shrink-0">
                <div
                  className={cn(
                    "h-14 w-14 rounded-full flex items-center justify-center transition-all duration-500",
                    status === "done" && "bg-brand-500/20 text-brand-500",
                    status === "running" && "bg-brand-500/10 text-brand-500 ring-4 ring-brand-500/10",
                    status === "pending" && "bg-surface-800 text-surface-500"
                  )}
                >
                  {status === "done" ? (
                    <Check className="h-6 w-6" />
                  ) : status === "running" ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>
                <p
                  className={cn(
                    "mt-3 text-sm font-medium",
                    status === "done" && "text-brand-500",
                    status === "running" && "text-brand-400",
                    status === "pending" && "text-surface-500"
                  )}
                >
                  {agent.name}
                </p>
                <p className="text-xs text-surface-500 mt-0.5">{agent.role}</p>
                {status === "running" && (
                  <p className="text-xs text-brand-500 mt-1 animate-pulse">
                    Working...
                  </p>
                )}
              </div>

              {i < AGENT_META.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 mt-[-2rem] transition-colors duration-500",
                    status === "done" ? "bg-brand-500/30" : "bg-surface-800"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
