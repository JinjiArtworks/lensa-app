import { TrendingUp } from "lucide-react";

// Bebas diakses Free maupun Pro — ini teaser nilai AI Insight, bukan bagian
// yang di-Pro-gate. Cuma grid "Semua Insight" (kategori Perlu Aksi/Rekomendasi
// lengkap) yang tetap Pro-only.
export function InsightSummaryCard({
  stats,
  compareLine,
  lastSyncedAt,
}: {
  stats: { total: number; urgent: number; newRecommendations: number };
  compareLine: string;
  lastSyncedAt: string;
}) {
  const secondary = [
    { label: "Perlu aksi segera", value: stats.urgent },
    { label: "Rekomendasi baru", value: stats.newRecommendations },
  ];

  return (
    <div className="mb-5 rounded-2xl border border-line bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wide text-ink-3">Total insight</div>
          <div className="mt-1 text-[32px] font-extrabold leading-none tracking-tight">{stats.total}</div>
        </div>
        <div className="flex flex-wrap gap-6">
          {secondary.map((it) => (
            <div key={it.label}>
              <div className="text-[11px] text-ink-3">{it.label}</div>
              <div className="mt-1 text-lg font-extrabold tracking-tight">{it.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line-2 pt-3 text-xs text-ink-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-3.5 shrink-0 text-accent-text" />
          {compareLine}
        </div>
        <span className="shrink-0 text-[11px] text-ink-3">Terakhir sync: {lastSyncedAt}</span>
      </div>
    </div>
  );
}
