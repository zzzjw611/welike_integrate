export default function Footer() {
  return (
    <footer className="border-t border-surface-800 mt-10 pt-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 text-[13px] text-surface-400">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-brand-500 flex items-center justify-center text-black text-[12px] font-bold">
            W
          </div>
          <span className="font-semibold text-white">
            WeLike <span className="text-surface-500 font-normal">/ AI Marketer News</span>
          </span>
        </div>
        <div className="text-[10.5px] uppercase tracking-widest text-surface-500 font-medium">
          Daily at 08:00 CST
        </div>
      </div>
      <p className="mt-4 text-[12.5px] leading-[1.6] text-surface-500 max-w-2xl">
        Each issue is produced by an AI pipeline + human curation. All "So what for marketer" notes are editorial opinion and do not constitute investment or procurement advice.
      </p>
    </footer>
  );
}
