import Link from 'next/link';

export const metadata = { title: 'Admin — AI Marketer Daily' };

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 p-8">
      <h1 className="text-2xl font-bold mb-2">Content Admin</h1>
      <p className="text-surface-500 text-sm mb-8">Manage daily content pipeline</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
        {[
          { href: '/admin/candidates', label: 'Candidates', desc: 'Review AI-sourced candidates', emoji: '📋' },
          { href: '/admin/editor',     label: 'Editor',     desc: 'Edit and approve drafts',    emoji: '✏️' },
          { href: '/admin/preview',    label: 'Preview',    desc: 'Preview before publishing',  emoji: '👁️' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl bg-surface-900 border border-surface-800 p-6 hover:border-brand-500/40 transition-colors"
          >
            <div className="text-2xl mb-3">{item.emoji}</div>
            <h2 className="font-semibold mb-1">{item.label}</h2>
            <p className="text-xs text-surface-500">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
