"use client";

// ===== Doughnut Chart =====
export function DoughnutChart({ data, colors, size = 120 }: { data: number[]; colors: string[]; size?: number }) {
  const total = data.reduce((a, b) => a + b, 0) || 1;
  const cx = size / 2, cy = size / 2, r = size * 0.38, sw = size * 0.18, circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = data.map((val) => {
    const pct = val / total;
    const len = pct * circ;
    const seg = { len, offset, pct };
    offset += len;
    return seg;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#262626" strokeWidth={sw} />
      {segments.map((seg, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={colors[i]} strokeWidth={sw}
          strokeDasharray={`${seg.len} ${circ - seg.len}`} strokeDashoffset={-offset + seg.len}
          transform={`rotate(-90 ${cx} ${cy})`} className="transition-all duration-500" />
      ))}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#f5f5f5" fontSize="14" fontWeight="700" fontFamily="Inter">{total}</text>
    </svg>
  );
}

// ===== Bar Chart =====
export function BarChart({ data, labels, colors, maxHeight = 160 }: { data: number[]; labels: string[]; colors: string[]; maxHeight?: number }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-3" style={{ height: maxHeight }}>
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
          <span className="text-[11px] font-mono text-surface-400">{val}</span>
          <div className="w-full rounded-t-md transition-all duration-500"
            style={{ height: `${(val / max) * 100}%`, backgroundColor: colors[i] + "cc", minHeight: val > 0 ? 4 : 0 }} />
          <span className="text-[10px] text-surface-500 text-center leading-tight max-w-[80px] truncate">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
