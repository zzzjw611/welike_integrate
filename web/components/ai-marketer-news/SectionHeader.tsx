import type { LucideIcon } from "lucide-react";

type Props = {
  eyebrow: string;
  title: string;
  count?: number;
  icon?: LucideIcon;
};

export default function SectionHeader({ eyebrow, title, count, icon: Icon }: Props) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-widest font-medium">
          {Icon && <Icon className="h-3.5 w-3.5 text-brand-500" strokeWidth={1.75} />}
          <span className="text-brand-500">{eyebrow}</span>
          {typeof count === "number" && (
            <span className="text-surface-500">· {count} item{count === 1 ? "" : "s"}</span>
          )}
        </div>
        <h2 className="mt-2 text-[28px] sm:text-[32px] font-bold leading-tight tracking-[-0.02em] text-white">
          {title}
        </h2>
      </div>
    </div>
  );
}
