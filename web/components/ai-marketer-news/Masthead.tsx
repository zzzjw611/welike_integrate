type Props = {
  date: string;
  issueNumber?: number;
  editor?: string;
};

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const weekdayEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
  const weekdayLong = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ][d.getDay()];
  const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
  const monthLong = [
    "January","February","March","April","May","June","July","August","September","October","November","December",
  ][d.getMonth()];
  return {
    short: `${weekdayEn} · ${month} ${d.getDate()}, ${d.getFullYear()}`,
    long: `${weekdayLong}, ${monthLong} ${d.getDate()}, ${d.getFullYear()}`,
  };
}

export default function Masthead({ date, issueNumber, editor }: Props) {
  const { short, long } = formatDate(date);
  return (
    <header className="border-b border-surface-800 pb-8 mb-12">
      <div className="flex items-center gap-3 mb-7">
        <div className="h-10 w-10 rounded-xl bg-brand-500 flex items-center justify-center text-black font-bold text-lg glow-brand">
          W
        </div>
        <div className="text-[13px] font-medium leading-tight">
          <div className="text-white font-semibold">
            WeLike <span className="text-surface-500 font-normal">/</span>{" "}
            <span className="text-surface-300">AI Marketer News</span>
          </div>
          <div className="text-[11px] uppercase tracking-widest text-surface-500 font-medium mt-0.5">
            Daily brief for AI marketers
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-surface-500 font-medium">
        <span>{short}</span>
        <span>
          {issueNumber ? `Issue № ${String(issueNumber).padStart(3, "0")}` : ""}
          {editor ? `  ·  Edited by ${editor}` : ""}
        </span>
      </div>

      <h1 className="mt-5 text-[44px] sm:text-[58px] font-bold leading-[1] tracking-[-0.03em]">
        <span className="text-gradient">AI Marketer News</span>
      </h1>

      <div className="mt-5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <p className="text-surface-400 text-[15px]">
          A 15-minute daily brief on AI for marketers.
        </p>
        <p className="text-[11px] uppercase tracking-widest text-surface-500 font-medium">{long}</p>
      </div>
    </header>
  );
}
