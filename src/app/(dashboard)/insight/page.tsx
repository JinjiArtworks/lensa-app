"use client";

import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { FilterBar, initialFilterValue, PRESET_LABELS, type FilterValue } from "@/components/shared/FilterBar";
import { SyncButton } from "@/components/shared/SyncButton";
import { CopyAsReportButton } from "@/components/shared/CopyAsReportButton";
import type { ExportReportData } from "@/components/shared/ExportReportModal";
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
import type { InsightItem } from "@/features/insight/types";

function SectionLabel({ children }: { children: string }) {
  return <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-ink-3">{children}</div>;
}

export default function InsightPage() {
  const activeBusinessId = useUiStore((s) => s.activeBusinessId) ?? undefined;
  const { lastSyncedAt } = useSyncStore();
  const [range, setRange] = useState<FilterValue>(initialFilterValue("week"));
  const rangeKey = range.preset === "custom" ? `custom:${range.from}:${range.to}` : range.preset;
  const { data: overviewData } = useOverviewData(activeBusinessId, rangeKey);
  const [category, setCategory] = useState<"all" | InsightItem["category"]>("all");
  const [platform, setPlatform] = useState<"all" | "meta" | "tiktok">("all");

  // Kartu anomali live (periode "Minggu Ini") butuh data platform bisnis aktif —
  // sebelum query itu resolve, getInsightsForPeriod jatuh balik ke item statis,
  // jadi halaman ini nggak perlu full-page loading gate kayak Overview/Detail.
  const periodItems = useMemo(
    () => getInsightsForPeriod(range.preset, overviewData?.PLATFORMS),
    [range.preset, overviewData]
  );
  const stats = useMemo(() => computeInsightStats(periodItems), [periodItems]);
  const priorityItems = useMemo(() => pickPriorityInsights(periodItems), [periodItems]);
  const visibleItems = useMemo(
    () => filterInsights(periodItems, category, platform),
    [periodItems, category, platform]
  );

  const reportData: ExportReportData = {
    scope: "AI Insight",
    period: PRESET_LABELS[range.preset],
    items: priorityItems.length > 0 ? priorityItems.map((it) => it.title) : ["Tidak ada aksi prioritas periode ini"],
    note: getCompareLine(range.preset),
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight">AI Insight</h1>
          <div className="mt-0.5 text-xs text-ink-3">Rekomendasi &amp; anomali otomatis · data terakhir diperbarui {lastSyncedAt}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterBar defaultPreset="week" onChange={setRange} />
          <SyncButton queryKey={["platform-metrics", activeBusinessId, rangeKey]} label="Sync & Analisis Ulang" />
          <CopyAsReportButton data={reportData} />
        </div>
      </div>

      <SectionLabel>Ringkasan</SectionLabel>
      <InsightStatsRow stats={stats} />
      <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-accent-bg px-3.5 py-2.5">
        <TrendingUp className="size-4 shrink-0 text-accent-text" />
        <div className="text-xs text-accent-text">{getCompareLine(range.preset)}</div>
      </div>

      <SectionLabel>Aksi Prioritas</SectionLabel>
      <div className="mb-5">
        <PriorityPanel items={priorityItems} />
      </div>

      <SectionLabel>Benchmark &amp; Rekomendasi Budget</SectionLabel>
      <div className="mb-5 grid grid-cols-2 gap-3.5 max-[980px]:grid-cols-1">
        <BenchmarkPanel category={INDUSTRY_BENCHMARK_CATEGORY} metrics={INDUSTRY_BENCHMARK} />
        <BudgetRecommendationPanel recommendations={BUDGET_REC} />
      </div>

      <SectionLabel>Semua Insight</SectionLabel>
      <InsightToolbar
        platform={platform}
        onPlatformChange={setPlatform}
        category={category}
        onCategoryChange={setCategory}
      />
      <InsightGrid items={visibleItems} />
    </div>
  );
}
