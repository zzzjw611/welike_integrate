import { getCandidates } from '@/lib/db';
import type { ContentCandidate } from '@/lib/types';

export const metadata = { title: 'Candidates — Admin' };

const SECTION_LABELS: Record<string, string> = {
  daily_brief:    'Daily Brief',
  growth_insight: 'Growth Insight',
  launch_radar:   'Launch Radar',
  daily_case:     'Daily Case',
};

const STATUS_COLORS: Record<string, string> = {
  pending:   'text-yellow-400 bg-yellow-400/10',
  approved:  'text-green-400 bg-green-400/10',
  rejected:  'text-red-400 bg-red-400/10',
  published: 'text-brand-500 bg-brand-500/10',
};

export default async function CandidatesPage() {
  const candidates = await getCandidates('pending');

  const grouped = candidates.reduce<Record<string, ContentCandidate[]>>((acc, c) => {
    const key = c.suggested_section ?? 'unsorted';
    (acc[key] ??= []).push(c);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 p-8">
      <div className="max-w-4xl">
        <h1 className="text-xl font-bold mb-1">Candidates</h1>
        <p className="text-surface-500 text-sm mb-8">
          {candidates.length} pending — sorted by AI impact score
        </p>

        {Object.entries(grouped).map(([section, items]) => (
          <div key={section} className="mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-4">
              {SECTION_LABELS[section] ?? section}
            </h2>
            <div className="space-y-3">
              {items.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg bg-surface-900 border border-surface-800 p-4"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <a
                      href={c.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-white hover:text-brand-500 transition-colors truncate"
                    >
                      {c.source_url}
                    </a>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm text-surface-400 line-clamp-2 mb-3">{c.ai_draft_en}</p>
                  <div className="flex gap-4 text-xs text-surface-600">
                    <span>Impact <strong className="text-surface-300">{c.ai_score.impact}</strong></span>
                    <span>Novelty <strong className="text-surface-300">{c.ai_score.novelty}</strong></span>
                    <span>Action <strong className="text-surface-300">{c.ai_score.actionability}</strong></span>
                    <span>Heat <strong className="text-surface-300">{c.ai_score.heat}</strong></span>
                  </div>
                  {/* Action buttons — wired up in Phase 2 */}
                  <div className="mt-3 flex gap-2">
                    <button className="text-xs px-3 py-1.5 rounded-md bg-brand-500/10 text-brand-500 border border-brand-500/20 hover:bg-brand-500/20 transition-colors">
                      ✓ Approve
                    </button>
                    <button className="text-xs px-3 py-1.5 rounded-md bg-surface-800 text-surface-400 hover:text-white transition-colors">
                      ✕ Reject
                    </button>
                    <button className="text-xs px-3 py-1.5 rounded-md bg-surface-800 text-surface-400 hover:text-white transition-colors">
                      ✏ Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {candidates.length === 0 && (
          <p className="text-surface-600 text-sm">No pending candidates.</p>
        )}
      </div>
    </div>
  );
}
