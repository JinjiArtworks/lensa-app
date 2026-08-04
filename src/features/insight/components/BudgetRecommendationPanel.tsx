"use client";

import { Button } from "@/components/ui/button";
import { PLATFORM_LABELS } from "@/features/overview-dashboard/mock-data";
import { useUiStore } from "@/stores/ui";
import type { BudgetRecommendation } from "../types";

const MOVE_TONE: Record<"up" | "down" | "flat", string> = {
  up: "bg-green-bg text-green",
  down: "bg-red-bg text-red",
  flat: "bg-gray-bg text-ink-2",
};

export function BudgetRecommendationPanel({ recommendations }: { recommendations: BudgetRecommendation[] }) {
  const showToast = useUiStore((s) => s.showToast);

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <h3 className="text-sm font-bold">Rekomendasi Alokasi Budget</h3>
      <div className="mt-0.5 text-[11.5px] text-ink-3">Saran distribusi budget bulan depan dari AI.</div>
      <div className="mt-3">
        {recommendations.map((rec) => {
          const platform = PLATFORM_LABELS[rec.key];
          const delta = rec.sug - rec.cur;
          const move = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
          const label = delta > 0 ? `+${delta}%` : delta < 0 ? `${delta}%` : "tetap";
          return (
            <div key={rec.key} className="flex items-start gap-3 border-b border-line-2 py-3 last:border-b-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-gray-bg text-[10px] font-extrabold text-ink-2">
                {platform.ic}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[12.5px] font-bold">
                  {platform.name}
                  <span className="text-[11.5px] font-semibold text-ink-2">
                    {rec.cur}% → {rec.sug}%
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide ${MOVE_TONE[move]}`}>
                    {label}
                  </span>
                </div>
                <div className="mt-1 text-[11.5px] leading-relaxed text-ink-2">{rec.why}</div>
              </div>
            </div>
          );
        })}
      </div>
      <Button
        className="mt-3.5 w-full justify-center"
        onClick={() => showToast("Realokasi budget diterapkan (simulasi)")}
      >
        Terapkan (simulasi)
      </Button>
    </div>
  );
}
