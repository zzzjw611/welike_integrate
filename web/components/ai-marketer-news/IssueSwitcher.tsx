import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";

type Props = {
  current: string;
  prev: string | null;
  next: string | null;
  isLatest?: boolean;
};

function formatShort(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
  return `${month} ${d.getDate()}`;
}

export default function IssueSwitcher({ current, prev, next, isLatest }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 mb-7 rounded-xl border border-surface-800 bg-surface-900/60 backdrop-blur-sm px-3 py-2">
      {prev ? (
        <Link
          href={`/tools/news/archive/${prev}`}
          className="group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] text-surface-300 hover:text-brand-500 hover:bg-surface-800/60 transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span className="hidden sm:inline">Previous</span>
          <span className="text-surface-500 group-hover:text-brand-500">· {formatShort(prev)}</span>
        </Link>
      ) : (
        <span className="flex items-center gap-2 px-2.5 py-1.5 text-[12px] text-surface-600 font-medium cursor-not-allowed">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span className="hidden sm:inline">Previous</span>
        </span>
      )}

      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-surface-400 font-semibold">
        <Calendar className="h-3 w-3 text-brand-500" strokeWidth={1.75} />
        <span>{formatShort(current)}</span>
        {isLatest && (
          <span className="ml-1 inline-flex items-center rounded-md bg-brand-500/15 px-1.5 py-0.5 text-[9.5px] text-brand-500 border border-brand-500/30">
            Today
          </span>
        )}
      </div>

      {next ? (
        <Link
          href={`/tools/news/archive/${next}`}
          className="group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] text-surface-300 hover:text-brand-500 hover:bg-surface-800/60 transition-colors font-medium"
        >
          <span className="text-surface-500 group-hover:text-brand-500">{formatShort(next)} ·</span>
          <span className="hidden sm:inline">Next</span>
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Link>
      ) : (
        <span className="flex items-center gap-2 px-2.5 py-1.5 text-[12px] text-surface-600 font-medium cursor-not-allowed">
          <span className="hidden sm:inline">Latest</span>
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
      )}
    </div>
  );
}
