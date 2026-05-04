"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ArchiveIndexPage() {
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news/archive")
      .then(r => r.json())
      .then(data => setDates(data.dates ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse 900px 600px at 10% 0%,rgba(0,245,160,.055) 0%,transparent 65%),radial-gradient(ellipse 700px 500px at 90% 100%,rgba(90,171,255,.05) 0%,transparent 60%),#07090d",
        color: "#ededea",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-14 sm:py-20">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/tools/news"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider uppercase"
            style={{ color: "var(--cn-t3, #4a4a45)" }}
          >
            ← Back to News
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold mt-4" style={{ color: "#ededea" }}>
            JE Labs Newsletter Archive
          </h1>
          <p className="text-sm mt-2" style={{ color: "#8f8f89" }}>
            Browse all past issues of the AI Marketer newsletter.
          </p>
        </div>

        {/* Issue list */}
        {loading ? (
          <div className="grid gap-3">
            {[0,1,2,3,4].map(i => (
              <div key={i} className="px-5 py-4 rounded-xl" style={{ background: "#0c0f16", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center justify-between">
                  <div className="sk" style={{ height: 16, width: 200, borderRadius: 4 }} />
                  <div className="sk" style={{ height: 12, width: 60, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : dates.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-lg" style={{ color: "#8f8f89" }}>No issues yet</div>
            <p className="text-sm mt-2" style={{ color: "#4a4a45" }}>
              Issues will appear here once they are generated.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {dates.map((date) => {
              const d = new Date(date);
              const label = d.toLocaleDateString("en-GB", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              });
              return (
                <Link
                  key={date}
                  href={`/tools/news/archive/${date}`}
                  className="block px-5 py-4 rounded-xl transition-all duration-200 archive-link"
                  style={{
                    background: "#0c0f16",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: "#ededea" }}>
                      {label}
                    </span>
                    <span className="text-xs font-mono font-bold tracking-wider uppercase" style={{ color: "#00F5A0" }}>
                      Read →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .archive-link:hover {
          border-color: rgba(255,255,255,0.12) !important;
          background: #111520 !important;
        }
        .sk {
          border-radius: 5px;
          background: linear-gradient(90deg, #0c0f16 25%, #111520 50%, #0c0f16 75%);
          background-size: 400% 100%;
          animation: sk-shimmer 1.7s ease-in-out infinite;
        }
        @keyframes sk-shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </div>
  );
}
