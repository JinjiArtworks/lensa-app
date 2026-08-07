"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { FilterBar, initialFilterValue, type FilterValue } from "@/components/shared/FilterBar";
import { SyncButton } from "@/components/shared/SyncButton";
import { CopyAsReportButton } from "@/components/shared/CopyAsReportButton";
import { ExportPdfButton } from "@/components/shared/ExportPdfButton";
import { ProUpgradeDialog } from "@/components/shared/ProUpgradeDialog";
import { useProGate } from "@/components/shared/use-pro-gate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUiStore } from "@/stores/ui";
import { useSyncStore } from "@/stores/sync";
import { useOverviewData } from "@/features/overview-dashboard/api/use-overview-data";
import { useConnectedPlatforms } from "@/features/binding/api/use-connect-platform";
import { BindingRequiredNotice } from "@/components/shared/BindingRequiredNotice";
import { InsightSummaryCard } from "@/features/insight/components/InsightSummaryCard";
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
  pickFreshInsight,
  pickPriorityInsights,
} from "@/features/insight/lib/insight-matcher";
import { BUDGET_REC, INDUSTRY_BENCHMARK, INDUSTRY_BENCHMARK_CATEGORY } from "@/features/insight/mock-data";
import type { InsightItem } from "@/features/insight/types";

export default function InsightPage() {
  const activeBusinessId = useUiStore((s) => s.activeBusinessId) ?? undefined;
  const showToast = useUiStore((s) => s.showToast);
  const { lastSyncedAt } = useSyncStore();
  const { isFree } = useProGate(activeBusinessId);
  const [range, setRange] = useState<FilterValue>(initialFilterValue("week"));
  const rangeKey = range.preset === "custom" ? `custom:${range.from}:${range.to}` : range.preset;
  const { data: connectedPlatforms = [] } = useConnectedPlatforms(activeBusinessId);
  const { data: overviewData } = useOverviewData(activeBusinessId, rangeKey, connectedPlatforms);
  const hasBinding = connectedPlatforms.length > 0;
  const [category, setCategory] = useState<"all" | InsightItem["category"]>("all");
  const [platform, setPlatform] = useState<"all" | "meta" | "tiktok">("all");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  // Simulasi "AI menemukan insight baru" saat Sync & Analisis Ulang diklik —
  // lihat pickFreshInsight() di insight-matcher.ts. Nambah (bukan gantiin) tiap
  // klik biar Total Insight dkk beneran naik terus, bukan cuma tetep +1 kayak
  // pendekatan sebelumnya. Direset kalau periode diganti — insight "baru" dari
  // lensa periode lain nggak relevan lagi.
  const [freshInsights, setFreshInsights] = useState<InsightItem[]>([]);
  const [showFreshBanner, setShowFreshBanner] = useState(false);

  useEffect(() => {
    setFreshInsights([]);
    setShowFreshBanner(false);
  }, [range.preset]);

  function handleInsightSync() {
    const next = pickFreshInsight(freshInsights.map((it) => it.id));
    if (!next) {
      showToast("Analisis ulang selesai — semua insight simulasi periode ini sudah ditemukan");
      return;
    }
    setFreshInsights((prev) => [next, ...prev]);
    setShowFreshBanner(true);
    showToast(`Analisis ulang selesai — insight baru ditemukan: "${next.title}"`);
  }

  // Kartu anomali live (periode "Minggu Ini") butuh data platform bisnis aktif —
  // sebelum query itu resolve, getInsightsForPeriod jatuh balik ke item statis,
  // jadi halaman ini nggak perlu full-page loading gate kayak Overview/Detail.
  const periodItems = useMemo(() => {
    const base = getInsightsForPeriod(range.preset, overviewData?.PLATFORMS);
    return [...freshInsights, ...base];
  }, [range.preset, overviewData, freshInsights]);
  const stats = useMemo(() => computeInsightStats(periodItems), [periodItems]);
  const priorityItems = useMemo(() => pickPriorityInsights(periodItems), [periodItems]);
  const visibleItems = useMemo(
    () => filterInsights(periodItems, category, platform),
    [periodItems, category, platform]
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight">AI Insight</h1>
          <div className="mt-0.5 text-xs text-ink-3">Rekomendasi &amp; aksi otomatis · data terakhir diperbarui {lastSyncedAt}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2" data-report-hide>
          <FilterBar defaultPreset="week" onChange={setRange} />
          <SyncButton
            queryKey={["platform-metrics", activeBusinessId, rangeKey]}
            label="Sync & Analisis Ulang"
            onSynced={handleInsightSync}
          />
          <CopyAsReportButton businessId={activeBusinessId} />
          <ExportPdfButton fileName="ai-insight" businessId={activeBusinessId} />
        </div>
      </div>

      {showFreshBanner && freshInsights.length > 0 && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-accent bg-accent-bg p-4">
          <Sparkles className="size-5 shrink-0 text-accent-text" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-[13px] font-bold text-accent-text">
              Insight baru dari analisis ulang
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-ink">
                Baru
              </span>
            </div>
            <div className="mt-1 text-[12.5px] leading-relaxed text-accent-text">
              <b>{freshInsights[0].title}</b> · {freshInsights[0].platformLabel} — {freshInsights[0].impactNote}
            </div>
            {freshInsights.length > 1 && (
              <div className="mt-1 text-[11px] text-accent-text/80">
                +{freshInsights.length - 1} insight baru lainnya dari sync sebelumnya di periode ini.
              </div>
            )}
          </div>
          <button
            type="button"
            title="Tutup"
            onClick={() => setShowFreshBanner(false)}
            className="shrink-0 text-accent-text"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {!hasBinding ? (
        <BindingRequiredNotice
          title="Kamu belum binding platform apapun"
          description="AI Insight butuh data dari platform iklan yang terhubung buat dianalisis. Hubungkan Meta Ads atau TikTok Ads dulu di menu Binding."
        />
      ) : (
        <>
          <InsightSummaryCard stats={stats} compareLine={getCompareLine(range.preset)} lastSyncedAt={lastSyncedAt} />

          <div className="mb-5">
            <PriorityPanel items={priorityItems} />
          </div>

          <Tabs defaultValue="insights">
            <TabsList>
              <TabsTrigger value="insights">Semua Insight</TabsTrigger>
              <TabsTrigger value="benchmark">Benchmark &amp; Budget</TabsTrigger>
            </TabsList>
            <TabsContent value="insights">
              <InsightToolbar
                platform={platform}
                onPlatformChange={setPlatform}
                category={category}
                onCategoryChange={setCategory}
              />
              <InsightGrid items={visibleItems} isFree={isFree} onUpgradeClick={() => setUpgradeOpen(true)} />
            </TabsContent>
            <TabsContent value="benchmark">
              <div className="grid grid-cols-2 gap-3.5 max-[980px]:grid-cols-1">
                <BenchmarkPanel category={INDUSTRY_BENCHMARK_CATEGORY} metrics={INDUSTRY_BENCHMARK} />
                <BudgetRecommendationPanel recommendations={BUDGET_REC} />
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      <ProUpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        title="Insight ini terkunci"
        description="Plan Free cuma buka AI Insight kategori Positif. Upgrade ke Pro buat lihat insight Perlu Aksi & Rekomendasi lengkap."
      />
    </div>
  );
}
