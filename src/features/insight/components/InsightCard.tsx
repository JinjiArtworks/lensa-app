"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Lightbulb, CheckCircle2, ThumbsUp, ThumbsDown } from "lucide-react";
import { useUiStore } from "@/stores/ui";
import type { InsightCategory, InsightItem } from "../types";

const CATEGORY_ICON: Record<InsightCategory, typeof AlertTriangle> = {
  anomali: AlertTriangle,
  rekomendasi: Lightbulb,
  positif: CheckCircle2,
};

const CATEGORY_LABEL: Record<InsightCategory, string> = {
  anomali: "Anomali",
  rekomendasi: "Rekomendasi",
  positif: "Positif",
};

const CATEGORY_TONE: Record<InsightCategory, string> = {
  anomali: "bg-red-bg text-red",
  rekomendasi: "bg-accent-bg text-accent-text",
  positif: "bg-green-bg text-green",
};

const IMPACT_TONE: Record<InsightItem["impact"], string> = {
  Tinggi: "bg-red-bg text-red",
  Sedang: "bg-amber-bg text-amber",
  Rendah: "bg-gray-bg text-ink-2",
};

export function InsightCard({ item }: { item: InsightItem }) {
  const showToast = useUiStore((s) => s.showToast);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const Icon = CATEGORY_ICON[item.category];

  function handleFeedback(helpful: boolean) {
    setFeedback(helpful ? "up" : "down");
    showToast(helpful ? "Terima kasih atas feedback-nya!" : "Feedback dicatat — akan kami tingkatkan.");
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-card p-4">
      <div className="flex items-start gap-3">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-[11px] ${CATEGORY_TONE[item.category]}`}>
          <Icon className="size-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap gap-1.5">
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${CATEGORY_TONE[item.category]}`}>
              {CATEGORY_LABEL[item.category]}
            </span>
            <span className="rounded-full bg-gray-bg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-2">
              {item.platformLabel}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${IMPACT_TONE[item.impact]}`}>
              Impact: {item.impact}
            </span>
          </div>
          <div className="text-[13.5px] font-bold">{item.title}</div>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-ink-2">{item.body}</p>
      <div className="rounded-lg bg-accent-bg px-2.5 py-2 text-[11.5px] font-semibold leading-relaxed text-accent-text">
        {item.impactNote}
      </div>
      <div className="mt-0.5 flex items-center justify-between">
        <span className="text-[11px] text-ink-3">{item.time}</span>
        <div className="flex items-center gap-2.5">
          {item.actionHref ? (
            <Link href={item.actionHref} className="text-xs font-bold text-accent-text">
              {item.actionLabel}
            </Link>
          ) : (
            <button
              type="button"
              className="text-xs font-bold text-accent-text"
              onClick={() => showToast("Saran ditandai diterapkan")}
            >
              {item.actionLabel}
            </button>
          )}
          <span className="flex items-center gap-1.5">
            <button
              type="button"
              title="Membantu"
              disabled={feedback !== null}
              onClick={() => handleFeedback(true)}
              className={`text-ink-3 ${feedback && feedback !== "up" ? "opacity-30" : ""}`}
            >
              <ThumbsUp className="size-[15px]" />
            </button>
            <button
              type="button"
              title="Tidak membantu"
              disabled={feedback !== null}
              onClick={() => handleFeedback(false)}
              className={`text-ink-3 ${feedback && feedback !== "down" ? "opacity-30" : ""}`}
            >
              <ThumbsDown className="size-[15px]" />
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
