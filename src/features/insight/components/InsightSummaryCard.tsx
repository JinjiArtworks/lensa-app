import { Lock, TrendingUp } from "lucide-react";
import { ProLockBadge } from "@/components/shared/ProLockBadge";

export function InsightSummaryCard({
  stats,
  isFree,
  compareLine,
}: {
  stats: { total: number; urgent: number; newRecommendations: number };
  isFree: boolean;
  compareLine: string;
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
        {isFree ? (
          // One combined lock instead of a separate padlock per stat — Free only ever sees
          // this as a single locked unit, not two near-identical "N 🔒 PRO" blocks side by side.
          <div className="flex items-center gap-2 rounded-xl bg-gray-bg px-3.5 py-2.5">
            <Lock className="size-4 shrink-0 text-ink-3" />
            <span className="text-xs text-ink-2">Perlu aksi segera &amp; Rekomendasi baru</span>
            <ProLockBadge tooltip="Statistik ini cuma tersedia di plan Pro" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-6">
            {secondary.map((it) => (
              <div key={it.label}>
                <div className="text-[11px] text-ink-3">{it.label}</div>
                <div className="mt-1 text-lg font-extrabold tracking-tight">{it.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-line-2 pt-3 text-xs text-ink-2">
        <TrendingUp className="size-3.5 shrink-0 text-accent-text" />
        {compareLine}
      </div>
    </div>
  );
}
