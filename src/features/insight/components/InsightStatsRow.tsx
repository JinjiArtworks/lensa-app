import { Lock } from "lucide-react";
import { ProLockBadge } from "@/components/shared/ProLockBadge";

export function InsightStatsRow({
  stats,
  isFree,
}: {
  stats: { total: number; urgent: number; newRecommendations: number };
  isFree: boolean;
}) {
  const items = [
    { label: "Total insight", value: stats.total, locked: false },
    { label: "Perlu aksi segera", value: stats.urgent, locked: isFree },
    { label: "Rekomendasi baru", value: stats.newRecommendations, locked: isFree },
  ];

  return (
    <div className="mb-4 flex flex-wrap gap-2.5">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border border-line bg-card px-4 py-2.5 text-xs text-ink-2">
          <div className="flex items-center gap-1.5">
            {it.locked ? (
              <Lock className="size-3.5 text-ink-3" />
            ) : (
              <b className="block text-[15px] text-ink">{it.value}</b>
            )}
            {it.locked && <ProLockBadge tooltip="Angka ini cuma tersedia di plan Pro" />}
          </div>
          {it.label}
        </div>
      ))}
    </div>
  );
}
