"use client";

import { AlertTriangle, Lightbulb, CheckCircle2 } from "lucide-react";
import { useUiStore } from "@/stores/ui";
import type { InsightCategory, InsightItem } from "../types";

const CATEGORY_ICON: Record<InsightCategory, typeof AlertTriangle> = {
  anomali: AlertTriangle,
  rekomendasi: Lightbulb,
  positif: CheckCircle2,
};

const CATEGORY_TONE: Record<InsightCategory, string> = {
  anomali: "bg-red-bg text-red",
  rekomendasi: "bg-accent-bg text-accent-text",
  positif: "bg-green-bg text-green",
};

// Category is conveyed by icon + this left border (same principle as the
// Overview Proactive Alert Card's border-left-4 treatment), not a separate
// pill — one fewer badge to scan per card.
const CATEGORY_BORDER: Record<InsightCategory, string> = {
  anomali: "border-l-red",
  rekomendasi: "border-l-accent",
  positif: "border-l-green",
};

const IMPACT_DOT_TONE: Record<InsightItem["impact"], string> = {
  Tinggi: "bg-red",
  Sedang: "bg-amber",
  Rendah: "bg-gray",
};

const IMPACT_TEXT_TONE: Record<InsightItem["impact"], string> = {
  Tinggi: "text-red",
  Sedang: "text-amber",
  Rendah: "text-ink-3",
};

export function InsightCard({ item }: { item: InsightItem }) {
  const showToast = useUiStore((s) => s.showToast);
  const Icon = CATEGORY_ICON[item.category];

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-line border-l-4 bg-card p-5 ${CATEGORY_BORDER[item.category]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className={`flex size-8 shrink-0 items-center justify-center rounded-[10px] ${CATEGORY_TONE[item.category]}`}>
            <Icon className="size-4" />
          </div>
          <div className="min-w-0 text-[13.5px] font-bold leading-snug">{item.title}</div>
        </div>
        <span className={`flex shrink-0 items-center gap-1.5 text-[11px] font-bold ${IMPACT_TEXT_TONE[item.impact]}`}>
          <i className={`inline-block size-1.5 rounded-full ${IMPACT_DOT_TONE[item.impact]}`} />
          {item.impact}
        </span>
      </div>
      <p className="text-[12.5px] leading-relaxed text-ink-2">{item.body}</p>
      <div className="rounded-lg bg-accent-bg px-3 py-2 text-[11.5px] font-semibold leading-relaxed text-accent-text">
        {item.impactNote}
      </div>
      <div className="mt-0.5 flex items-center justify-between gap-2 border-t border-line-2 pt-2.5">
        <span className="text-[11px] text-ink-3">
          {item.platformLabel} · {item.time}
        </span>
        <button
          type="button"
          className="text-xs font-bold text-accent-text"
          onClick={() => showToast(item.actionLabel.replace(/^Tandai/, "Ditandai"))}
        >
          {item.actionLabel}
        </button>
      </div>
    </div>
  );
}
