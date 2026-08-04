"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui";
import { useSyncStore } from "@/stores/sync";
import { useOverviewData } from "@/features/overview-dashboard/api/use-overview-data";
import { InsightStatsRow } from "@/features/insight/components/InsightStatsRow";
import { PriorityPanel } from "@/features/insight/components/PriorityPanel";
import { BenchmarkPanel } from "@/features/insight/components/BenchmarkPanel";
import { BudgetRecommendationPanel } from "@/features/insight/components/BudgetRecommendationPanel";
import { InsightToolbar } from "@/features/insight/components/InsightToolbar";
import { InsightGrid } from "@/features/insight/components/InsightGrid";
import {
  computeInsightStats,
  filterInsights,
  getCompareLine,
  getInsightsForPeriod,
  pickPriorityInsights,
} from "@/features/insight/lib/insight-matcher";
import { BUDGET_REC, INDUSTRY_BENCHMARK, INDUSTRY_BENCHMARK_CATEGORY } from "@/features/insight/mock-data";
import type { InsightItem, PeriodKey } from "@/features/insight/types";

export default function InsightPage() {
  const showToast = useUiStore((s) => s.showToast);
  const activeBusinessId = useUiStore((s) => s.activeBusinessId) ?? undefined;
  const { syncing, triggerSync } = useSyncStore();
  const queryClient = useQueryClient();
  const { data: overviewData } = useOverviewData(activeBusinessId);
  const [period, setPeriod] = useState<PeriodKey>("yesterday");
  const [category, setCategory] = useState<"all" | InsightItem["category"]>("all");
  const [platform, setPlatform] = useState<"all" | "meta" | "tiktok">("all");
  const [analyzedAt, setAnalyzedAt] = useState<string | null>(null);

  // Kartu anomali live (periode "Kemarin") butuh data platform bisnis aktif —
  // sebelum query itu resolve, getInsightsForPeriod jatuh balik ke item statis,
  // jadi halaman ini nggak perlu full-page loading gate kayak Overview/Detail.
  const periodItems = useMemo(
    () => getInsightsForPeriod(period, overviewData?.PLATFORMS),
    [period, overviewData]
  );
  const stats = useMemo(() => computeInsightStats(periodItems), [periodItems]);
  const priorityItems = useMemo(() => pickPriorityInsights(periodItems), [periodItems]);
  const visibleItems = useMemo(
    () => filterInsights(periodItems, category, platform),
    [periodItems, category, platform]
  );

  async function handleSync() {
    await triggerSync();
    // "Sync & Analisis Ulang" tetap simulasi template-matching (deterministik,
    // bukan live AI generation, sesuai business-plan.md §9) — tapi data platform
    // yang jadi input-nya sekarang beneran di-refetch dari Route Handler, bukan
    // cuma nunggu timer lokal.
    await queryClient.invalidateQueries({ queryKey: ["platform-metrics", activeBusinessId] });
    setAnalyzedAt("baru saja");
    showToast("Analisis AI selesai — 1 insight baru ditemukan");
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight">AI Insight</h1>
          <div className="mt-0.5 text-xs text-ink-3">
            {analyzedAt ? `AI selesai menganalisis · ${analyzedAt}` : "Diperbarui otomatis tiap sync data"}
          </div>
        </div>
        <Button variant="ghost" disabled={syncing} onClick={handleSync}>
          <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Menganalisis…" : "Sync & Analisis Ulang"}
        </Button>
      </div>

      <InsightStatsRow stats={stats} />

      <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-accent-bg px-3.5 py-2.5">
        <TrendingUp className="size-4 shrink-0 text-accent-text" />
        <div className="text-xs text-accent-text">{getCompareLine(period)}</div>
      </div>

      <PriorityPanel items={priorityItems} />

      <div className="mb-4 grid grid-cols-2 gap-3.5 max-[980px]:grid-cols-1">
        <BenchmarkPanel category={INDUSTRY_BENCHMARK_CATEGORY} metrics={INDUSTRY_BENCHMARK} />
        <BudgetRecommendationPanel recommendations={BUDGET_REC} />
      </div>

      <InsightToolbar
        period={period}
        onPeriodChange={setPeriod}
        platform={platform}
        onPlatformChange={setPlatform}
        category={category}
        onCategoryChange={setCategory}
      />

      <InsightGrid items={visibleItems} />
    </div>
  );
}
