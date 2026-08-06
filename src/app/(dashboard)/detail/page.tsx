"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FilterBar, initialFilterValue, type FilterPreset, type FilterValue } from "@/components/shared/FilterBar";
import { SyncButton } from "@/components/shared/SyncButton";
import { CopyAsReportButton } from "@/components/shared/CopyAsReportButton";
import type { ExportReportData } from "@/components/shared/ExportReportModal";
import { useUiStore } from "@/stores/ui";
import { useSyncStore } from "@/stores/sync";
import { useOverviewData } from "@/features/overview-dashboard/api/use-overview-data";
import { PLATFORM_CHART_COLOR } from "@/features/overview-dashboard/mock-data";
import { PlatformKpiGrid, type KpiEntry } from "@/features/detail-platform/components/PlatformKpiGrid";
import { PlatformTrendChart } from "@/features/detail-platform/components/PlatformTrendChart";
import { PlatformCampaignTable } from "@/features/detail-platform/components/PlatformCampaignTable";

const ALL_PLATFORM_COLOR = "#6b6b76"; // neutral ink-2 — never shown alongside meta/tiktok at once, so no CVD pairing to validate

function rangeLabel(preset: FilterPreset): string {
  switch (preset) {
    case "week":
      return "7 hari";
    case "month":
      return "30 hari";
    case "year":
      return "1 tahun";
    case "custom":
      return "periode custom";
  }
}

export default function DetailPlatformPage() {
  const activeBusinessId = useUiStore((s) => s.activeBusinessId) ?? undefined;
  const platform = useUiStore((s) => s.detailPlatformView);
  const { lastSyncedAt } = useSyncStore();
  const [range, setRange] = useState<FilterValue>(initialFilterValue("year"));
  const rangeKey = range.preset === "custom" ? `custom:${range.from}:${range.to}` : range.preset;
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useOverviewData(activeBusinessId, rangeKey);

  const mergedTrend = useMemo(() => {
    if (!data) return [];
    return data.PLATFORM_TREND.meta.map((point, i) => ({
      day: point.day,
      spend: point.spend + data.PLATFORM_TREND.tiktok[i].spend,
      closing: point.closing + data.PLATFORM_TREND.tiktok[i].closing,
    }));
  }, [data]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight">Detail Platform</h1>
          <div className="mt-0.5 text-xs text-ink-3">
            Drill-down performa per platform · pilih platform di menu sidebar · data terakhir diperbarui{" "}
            {lastSyncedAt}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterBar defaultPreset="year" onChange={setRange} />
          <SyncButton queryKey={["platform-metrics", activeBusinessId, rangeKey]} />
        </div>
      </div>
      {isError ? (
        <div className="py-10 text-center text-xs text-red">
          Gagal memuat data platform.{" "}
          <button
            type="button"
            className="font-bold underline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["platform-metrics", activeBusinessId, rangeKey] })}
          >
            Coba lagi
          </button>
        </div>
      ) : isLoading || !data ? (
        <div className="py-10 text-center text-xs text-ink-3">Memuat data platform…</div>
      ) : (
        (() => {
          const scopeName = platform === "all" ? "Semua Platform" : data.PLATFORMS[platform].name;
          const kpiEntries: KpiEntry[] =
            platform === "all"
              ? [...data.KPI_ROW_1, ...data.KPI_ROW_2]
              : Object.entries(data.PLATFORMS[platform].metrics).map(([label, m]) => ({ label, ...m }));
          const roasEntry = kpiEntries.find((e) => e.label.includes("ROAS"));
          const spendEntry = kpiEntries.find((e) => e.label.includes("Spend"));
          const closingEntry = kpiEntries.find((e) => e.label.includes("Closing"));
          const trendData = platform === "all" ? mergedTrend : data.PLATFORM_TREND[platform];
          const trendColor = platform === "all" ? ALL_PLATFORM_COLOR : PLATFORM_CHART_COLOR[platform];
          const period = rangeLabel(range.preset);
          const reportData: ExportReportData = {
            scope: scopeName,
            roas: `${roasEntry?.value ?? "-"} ROAS`,
            spend: spendEntry?.value ?? "-",
            closing: closingEntry?.value ?? "-",
            note: `Performa ${scopeName} ${period} terakhir — cek tab Campaign untuk breakdown per campaign.`,
            period,
          };
          return (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
                <h2 className="text-[17px] font-bold">{scopeName}</h2>
                <CopyAsReportButton data={reportData} />
              </div>
              <PlatformKpiGrid entries={kpiEntries} />
              <PlatformTrendChart data={trendData} color={trendColor} label={scopeName} />
              <PlatformCampaignTable platformKey={platform} campaigns={data.CAMPAIGNS} />
            </>
          );
        })()
      )}
    </div>
  );
}
