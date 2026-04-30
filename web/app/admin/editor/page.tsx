export const metadata = { title: 'Editor — Admin' };

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 p-8">
      <h1 className="text-xl font-bold mb-1">Draft Editor</h1>
      <p className="text-surface-500 text-sm mb-8">
        Inline edit · EN/ZH comparison · Source validation
      </p>
      <div className="rounded-xl border border-surface-800 bg-surface-900 p-6 text-surface-600 text-sm">
        Editor UI — Phase 2 implementation
      </div>
    </div>
  );
}
