"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FilterBar, initialFilterValue, type FilterPreset, type FilterValue } from "@/components/shared/FilterBar";
import { SyncButton } from "@/components/shared/SyncButton";
import { CopyAsReportButton } from "@/components/shared/CopyAsReportButton";
import type { ExportReportData } from "@/components/shared/ExportReportModal";
import { useUiStore } from "@/stores/ui";
import { useSyncStore } from "@/stores/sync";
import { useOverviewData } from "@/features/overview-dashboard/api/use-overview-data";
import { PlatformSwitcher, type PlatformKey } from "@/features/detail-platform/components/PlatformSwitcher";
import { PlatformKpiGrid } from "@/features/detail-platform/components/PlatformKpiGrid";
import { PlatformTrendChart } from "@/features/detail-platform/components/PlatformTrendChart";
import { PlatformCampaignTable } from "@/features/detail-platform/components/PlatformCampaignTable";

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
  const { lastSyncedAt } = useSyncStore();
  const [platform, setPlatform] = useState<PlatformKey>("meta");
  const [range, setRange] = useState<FilterValue>(initialFilterValue("year"));
  const rangeKey = range.preset === "custom" ? `custom:${range.from}:${range.to}` : range.preset;
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useOverviewData(activeBusinessId, rangeKey);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight">Detail Platform</h1>
          <div className="mt-0.5 text-xs text-ink-3">Drill-down performa per platform · data terakhir diperbarui {lastSyncedAt}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterBar defaultPreset="year" onChange={setRange} />
          <SyncButton queryKey={["platform-metrics", activeBusinessId, rangeKey]} />
        </div>
      </div>
      <PlatformSwitcher active={platform} onSelect={setPlatform} />
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
          const activePlatform = data.PLATFORMS[platform];
          const period = rangeLabel(range.preset);
          const reportData: ExportReportData = {
            scope: activePlatform.name,
            roas: `${activePlatform.metrics.ROAS.value} ROAS`,
            spend: activePlatform.metrics.Spend.value,
            closing: activePlatform.metrics.Closing.value,
            note: `Performa ${activePlatform.name} ${period} terakhir — cek tab Campaign untuk breakdown per campaign.`,
            period,
          };
          return (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
                <h2 className="text-[17px] font-bold">{activePlatform.name}</h2>
                <CopyAsReportButton data={reportData} />
              </div>
              <PlatformKpiGrid platformKey={platform} platforms={data.PLATFORMS} />
              <PlatformTrendChart platformKey={platform} trendData={data.PLATFORM_TREND} />
              <PlatformCampaignTable platformKey={platform} campaigns={data.CAMPAIGNS} />
            </>
          );
        })()
      )}
    </div>
  );
}
