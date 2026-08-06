import { AlertTriangle, Lightbulb } from "lucide-react";
import { ProLockBadge } from "@/components/shared/ProLockBadge";
import type { InsightCategory } from "../types";

const META: Partial<Record<InsightCategory, { label: string; icon: typeof AlertTriangle; tone: string }>> = {
  anomali: { label: "Anomali", icon: AlertTriangle, tone: "bg-red-bg text-red" },
  rekomendasi: { label: "Rekomendasi", icon: Lightbulb, tone: "bg-accent-bg text-accent-text" },
};

export function LockedCategorySection({
  category,
  count,
  onUpgradeClick,
}: {
  category: "anomali" | "rekomendasi";
  count: number;
  onUpgradeClick: () => void;
}) {
  const meta = META[category]!;
  const Icon = meta.icon;

  return (
    <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-line bg-gray-bg p-6 text-center">
      <div className={`flex size-11 shrink-0 items-center justify-center rounded-[11px] ${meta.tone}`}>
        <Icon className="size-5" />
      </div>
      <div className="flex items-center gap-1.5">
        <h3 className="text-sm font-bold">
          {count} Insight {meta.label}
        </h3>
        <ProLockBadge tooltip={`Kategori ${meta.label} cuma tersedia di plan Pro`} />
      </div>
      <p className="max-w-sm text-xs leading-relaxed text-ink-3">
        Plan Free cuma buka kategori Positif. Upgrade ke Pro buat lihat semua insight {meta.label.toLowerCase()}.
      </p>
      <button
        type="button"
        onClick={onUpgradeClick}
        className="rounded-lg bg-accent px-4 py-1.5 text-[11px] font-bold text-ink"
      >
        Upgrade ke Pro buat buka
      </button>
    </div>
  );
}
