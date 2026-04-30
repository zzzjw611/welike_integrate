"use client";
import { Globe, TrendingUp, Users, Shield, AlertTriangle } from "lucide-react";

interface ScoutData {
  productSummary: string;
  competitors: {
    name: string;
    url: string;
    positioning: string;
    strengths: string[];
    weaknesses: string[];
    pricing?: string;
  }[];
  marketTrends: string[];
  userPersonas: {
    name: string;
    role: string;
    painPoints: string[];
    goals: string[];
    channels: string[];
  }[];
  opportunities: string[];
  threats: string[];
}

export function ScoutResults({ data }: { data: ScoutData }) {
  return (
    <div className="space-y-8">
      {/* Product Summary */}
      <section>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Globe className="h-5 w-5 text-brand-500" /> Product Summary
        </h3>
        <p className="text-sm text-surface-300 bg-brand-500/5 border border-brand-500/10 rounded-lg p-4 leading-relaxed">
          {data.productSummary}
        </p>
      </section>

      {/* Competitors Table */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Competitive Landscape</h3>
        <div className="overflow-x-auto rounded-lg border border-surface-800">
          <table className="w-full text-sm">
            <thead className="bg-surface-900">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-surface-400">Competitor</th>
                <th className="text-left px-4 py-3 font-medium text-surface-400">Positioning</th>
                <th className="text-left px-4 py-3 font-medium text-surface-400">Strengths</th>
                <th className="text-left px-4 py-3 font-medium text-surface-400">Weaknesses</th>
                <th className="text-left px-4 py-3 font-medium text-surface-400">Pricing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {data.competitors.map((c) => (
                <tr key={c.name} className="hover:bg-surface-900/50">
                  <td className="px-4 py-3">
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-500 hover:text-brand-400 font-medium"
                    >
                      {c.name}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-surface-400 max-w-xs">
                    {c.positioning}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.strengths.map((s) => (
                        <span
                          key={s}
                          className="inline-block bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.weaknesses.map((w) => (
                        <span
                          key={w}
                          className="inline-block bg-red-500/10 text-red-400 text-xs px-2 py-0.5 rounded"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-surface-400">{c.pricing || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* User Personas */}
      <section>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-400" /> User Personas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.userPersonas.map((p) => (
            <div key={p.name} className="rounded-lg border border-surface-800 p-4 bg-surface-900">
              <h4 className="font-semibold text-purple-400">{p.name}</h4>
              <p className="text-xs text-surface-500 mb-3">{p.role}</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-surface-500 uppercase">Pain Points</p>
                  <ul className="text-sm text-surface-300 list-disc list-inside">
                    {p.painPoints.map((pp) => (
                      <li key={pp}>{pp}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-500 uppercase">Goals</p>
                  <ul className="text-sm text-surface-300 list-disc list-inside">
                    {p.goals.map((g) => (
                      <li key={g}>{g}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-surface-500 uppercase">Channels</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.channels.map((ch) => (
                      <span
                        key={ch}
                        className="bg-surface-800 text-surface-400 text-xs px-2 py-0.5 rounded"
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trends + Opportunities + Threats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-brand-500" /> Market Trends
          </h3>
          <ul className="space-y-2">
            {data.marketTrends.map((t) => (
              <li key={t} className="text-sm text-surface-300 bg-surface-900 border border-surface-800 rounded p-2">
                {t}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-green-400" /> Opportunities
          </h3>
          <ul className="space-y-2">
            {data.opportunities.map((o) => (
              <li key={o} className="text-sm text-surface-300 bg-green-500/5 border border-green-500/10 rounded p-2">
                {o}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-400" /> Threats
          </h3>
          <ul className="space-y-2">
            {data.threats.map((t) => (
              <li key={t} className="text-sm text-surface-300 bg-amber-500/5 border border-amber-500/10 rounded p-2">
                {t}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
