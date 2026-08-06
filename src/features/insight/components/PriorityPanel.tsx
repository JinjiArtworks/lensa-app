"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { ProLockBadge } from "@/components/shared/ProLockBadge";
import { useUiStore } from "@/stores/ui";
import type { ImpactLevel, InsightItem } from "../types";

const IMPACT_TONE: Record<ImpactLevel, { bg: string; fg: string }> = {
  Tinggi: { bg: "var(--red-bg)", fg: "var(--red)" },
  Sedang: { bg: "var(--amber-bg)", fg: "var(--amber)" },
  Rendah: { bg: "var(--gray-bg)", fg: "var(--ink-2)" },
};

export function PriorityPanel({
  items,
  isFree,
  onUpgradeClick,
}: {
  items: InsightItem[];
  isFree: boolean;
  onUpgradeClick: () => void;
}) {
  const showToast = useUiStore((s) => s.showToast);
  // Free-accessible (Positif) items first, same principle as InsightGrid's
  // category grouping — open content ahead of what's locked, not interleaved.
  const visible = isFree ? items.filter((it) => it.category === "positif") : items;
  const lockedCount = isFree ? items.length - visible.length : 0;

  return (
    <div className="mb-4 rounded-2xl border border-line bg-card p-4">
      <h3 className="text-sm font-bold">Rekomendasi Prioritas</h3>
      <div className="mt-0.5 text-[11.5px] text-ink-3">Yang sebaiknya kamu lakukan duluan setelah review performa ini.</div>
      {items.length === 0 ? (
        <div className="py-5 text-center text-xs text-ink-3">Semua metrik dalam kondisi baik — belum ada aksi prioritas periode ini.</div>
      ) : (
        <div className="mt-3">
          {visible.map((it, idx) => {
            const tone = IMPACT_TONE[it.impact];
            return (
              <div key={it.id} className="flex items-start gap-3 border-b border-line-2 py-3 last:border-b-0">
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-[9px] text-[10.5px] font-extrabold"
                  style={{ background: tone.bg, color: tone.fg }}
                >
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[12.5px] font-bold">
                    {it.title}
                    <span className="text-[11.5px] font-semibold text-ink-2">{it.platformLabel}</span>
                  </div>
                  <div className="mt-1 text-[11.5px] leading-relaxed text-ink-2">
                    {it.impactNote}{" "}
                    {it.actionHref ? (
                      <Link href={it.actionHref} className="font-bold text-accent-text">
                        {it.actionLabel}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="font-bold text-accent-text"
                        onClick={() => showToast("Saran ditandai diterapkan")}
                      >
                        {it.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {lockedCount > 0 && (
            <div className="flex items-center gap-3 border-t border-line-2 py-3 first:border-t-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-gray-bg text-ink-2">
                <Lock className="size-3.5" />
              </div>
              <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[12.5px] font-bold">
                  {lockedCount} rekomendasi prioritas lain terkunci
                  <ProLockBadge tooltip="Rekomendasi prioritas Anomali & Rekomendasi cuma tersedia di plan Pro" />
                </div>
                <button type="button" onClick={onUpgradeClick} className="text-[11.5px] font-bold text-accent-text">
                  Upgrade ke Pro
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
