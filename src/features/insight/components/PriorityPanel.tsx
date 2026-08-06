"use client";

import { useUiStore } from "@/stores/ui";
import type { ImpactLevel, InsightItem } from "../types";

const IMPACT_TONE: Record<ImpactLevel, { bg: string; fg: string }> = {
  Tinggi: { bg: "var(--red-bg)", fg: "var(--red)" },
  Sedang: { bg: "var(--amber-bg)", fg: "var(--amber)" },
  Rendah: { bg: "var(--gray-bg)", fg: "var(--ink-2)" },
};

// Bebas diakses Free maupun Pro — ini teaser nilai AI Insight (ringkasan +
// rekomendasi teratas), bukan bagian yang di-Pro-gate. Cuma grid "Semua
// Insight" (kategori Perlu Aksi/Rekomendasi lengkap) yang tetap Pro-only.
export function PriorityPanel({ items }: { items: InsightItem[] }) {
  const showToast = useUiStore((s) => s.showToast);

  return (
    <div className="mb-4 rounded-2xl border border-line bg-card p-5">
      <h3 className="text-sm font-bold">Rekomendasi Prioritas</h3>
      <div className="mt-0.5 text-[11.5px] text-ink-3">Yang sebaiknya kamu lakukan duluan setelah review performa ini.</div>
      {items.length === 0 ? (
        <div className="py-5 text-center text-xs text-ink-3">Semua metrik dalam kondisi baik — belum ada aksi prioritas periode ini.</div>
      ) : (
        <div className="mt-3.5">
          {items.map((it, idx) => {
            const tone = IMPACT_TONE[it.impact];
            return (
              <div key={it.id} className="flex items-start gap-3.5 border-b border-line-2 py-3.5 last:border-b-0">
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-[10px] text-[11px] font-extrabold"
                  style={{ background: tone.bg, color: tone.fg }}
                >
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[13px] font-bold">
                    {it.title}
                    <span className="text-[11.5px] font-semibold text-ink-2">{it.platformLabel}</span>
                  </div>
                  <div className="mt-1 text-[12px] leading-relaxed text-ink-2">
                    {it.impactNote}{" "}
                    <button
                      type="button"
                      className="font-bold text-accent-text"
                      onClick={() => showToast(it.actionLabel.replace(/^Tandai/, "Ditandai"))}
                    >
                      {it.actionLabel}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
