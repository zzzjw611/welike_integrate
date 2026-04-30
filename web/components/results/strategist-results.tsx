"use client";
import { Target, MessageSquare, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StrategistData {
  gtmPlan: {
    overview: string;
    targetSegments: string[];
    positioningStatement: string;
    channelPriorities: {
      channel: string;
      priority: "high" | "medium" | "low";
      rationale: string;
      estimatedImpact: string;
    }[];
  };
  messagingFramework: {
    headline: string;
    tagline: string;
    valuePropositions: string[];
    objectionHandling: { objection: string; response: string }[];
    elevatorPitch: string;
  };
  launchPlaybook: { day: string; tasks: string[] }[];
  thirtyDayPlan: string[];
  sixtyDayPlan: string[];
  ninetyDayPlan: string[];
}

const PRIORITY_STYLES = {
  high: "bg-green-500/10 text-green-400 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  low: "bg-surface-800 text-surface-400 border-surface-700",
};

export function StrategistResults({ data }: { data: StrategistData }) {
  return (
    <div className="space-y-8">
      {/* GTM Overview */}
      <section>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Target className="h-5 w-5 text-brand-500" /> GTM Strategy
        </h3>
        <div className="bg-brand-500/5 border border-brand-500/10 rounded-lg p-4 space-y-3">
          <p className="text-sm text-surface-300 leading-relaxed whitespace-pre-line">
            {data.gtmPlan.overview}
          </p>
          <div className="bg-surface-900 rounded p-3 border border-surface-800">
            <p className="text-xs font-medium text-surface-500 uppercase mb-1">
              Positioning Statement
            </p>
            <p className="text-sm font-medium text-white italic">
              {data.gtmPlan.positioningStatement}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-surface-500 uppercase mb-1">
              Target Segments
            </p>
            <div className="flex flex-wrap gap-2">
              {data.gtmPlan.targetSegments.map((s) => (
                <span
                  key={s}
                  className="bg-brand-500/10 text-brand-400 text-xs px-2 py-1 rounded"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Messaging Framework */}
      <section>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-400" /> Messaging Framework
        </h3>
        <div className="bg-surface-900 rounded-lg border border-surface-800 p-5 space-y-4">
          <div className="text-center border-b border-surface-800 pb-4">
            <h4 className="text-xl font-bold text-white">
              {data.messagingFramework.headline}
            </h4>
            <p className="text-surface-400 mt-1">
              {data.messagingFramework.tagline}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-surface-500 uppercase mb-2">
              Value Propositions
            </p>
            <ul className="space-y-2">
              {data.messagingFramework.valuePropositions.map((v, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-surface-300"
                >
                  <span className="bg-purple-500/20 text-purple-400 rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {v}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-surface-800 rounded p-3">
            <p className="text-xs font-medium text-surface-500 uppercase mb-1">
              Elevator Pitch
            </p>
            <p className="text-sm text-surface-300 italic">
              {data.messagingFramework.elevatorPitch}
            </p>
          </div>
          {data.messagingFramework.objectionHandling.length > 0 && (
            <div>
              <p className="text-xs font-medium text-surface-500 uppercase mb-2">
                Objection Handling
              </p>
              <div className="space-y-2">
                {data.messagingFramework.objectionHandling.map((oh, i) => (
                  <div key={i} className="bg-surface-800 rounded p-3">
                    <p className="text-sm font-medium text-red-400">
                      &ldquo;{oh.objection}&rdquo;
                    </p>
                    <p className="text-sm text-surface-300 mt-1">
                      <ArrowRight className="inline h-3 w-3 mr-1 text-brand-500" />
                      {oh.response}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Channel Priorities */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Channel Priorities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.gtmPlan.channelPriorities.map((ch) => (
            <div key={ch.channel} className="rounded-lg border border-surface-800 bg-surface-900 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{ch.channel}</h4>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded border font-medium",
                    PRIORITY_STYLES[ch.priority]
                  )}
                >
                  {ch.priority}
                </span>
              </div>
              <p className="text-sm text-surface-400">{ch.rationale}</p>
              <p className="text-xs text-surface-500 mt-2">
                Impact: {ch.estimatedImpact}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Launch Playbook */}
      <section>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-orange-400" /> Launch Playbook
        </h3>
        <div className="space-y-3">
          {data.launchPlaybook.map((day) => (
            <div
              key={day.day}
              className="flex gap-4 bg-surface-900 rounded-lg border border-surface-800 p-4"
            >
              <div className="flex-shrink-0 w-16 text-center">
                <span className="bg-orange-500/10 text-orange-400 font-semibold text-sm px-3 py-1 rounded">
                  {day.day}
                </span>
              </div>
              <ul className="text-sm text-surface-300 space-y-1">
                {day.tasks.map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-surface-600 mt-0.5">&#x2022;</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 30/60/90 Day Plan */}
      <section>
        <h3 className="text-lg font-semibold mb-3">30 / 60 / 90 Day Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "30 Days", items: data.thirtyDayPlan, color: "brand" },
            { label: "60 Days", items: data.sixtyDayPlan, color: "purple" },
            { label: "90 Days", items: data.ninetyDayPlan, color: "green" },
          ].map(({ label, items, color }) => (
            <div key={label} className="rounded-lg border border-surface-800 bg-surface-900 p-4">
              <h4
                className={cn(
                  "font-semibold text-sm mb-2",
                  color === "brand" && "text-brand-500",
                  color === "purple" && "text-purple-400",
                  color === "green" && "text-green-400"
                )}
              >
                {label}
              </h4>
              <ul className="text-sm text-surface-300 space-y-1.5">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-surface-600 mt-0.5">&#x2022;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
