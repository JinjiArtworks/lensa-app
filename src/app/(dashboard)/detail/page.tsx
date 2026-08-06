"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { FilterBar, initialFilterValue, type FilterValue } from "@/components/shared/FilterBar";
import { SyncButton } from "@/components/shared/SyncButton";
import { useUiStore } from "@/stores/ui";
import { useSyncStore } from "@/stores/sync";
import { useOverviewData } from "@/features/overview-dashboard/api/use-overview-data";
import { PLATFORM_CHART_COLOR } from "@/features/overview-dashboard/mock-data";
import { PlatformKpiGrid, type KpiEntry } from "@/features/detail-platform/components/PlatformKpiGrid";
import { PlatformTrendChart } from "@/features/detail-platform/components/PlatformTrendChart";

// Lazy: both read Firestore directly (plan gating) — keeps the Firestore SDK
// out of this route's initial JS (same reasoning as Overview's CoverageBanner).
const CopyAsReportButton = dynamic(() =>
  import("@/components/shared/CopyAsReportButton").then((m) => m.CopyAsReportButton)
);
const ExportPdfButton = dynamic(() => import("@/components/shared/ExportPdfButton").then((m) => m.ExportPdfButton));

export default function DetailPlatformPage() {
  const activeBusinessId = useUiStore((s) => s.activeBusinessId) ?? undefined;
  const platform = useUiStore((s) => s.detailPlatformView);
  const { lastSyncedAt } = useSyncStore();
  const [range, setRange] = useState<FilterValue>(initialFilterValue("year"));
  const rangeKey = range.preset === "custom" ? `custom:${range.from}:${range.to}` : range.preset;
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useOverviewData(activeBusinessId, rangeKey);

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
        <div className="flex flex-wrap items-center gap-2" data-report-hide>
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
          const activePlatform = data.PLATFORMS[platform];
          const kpiEntries: KpiEntry[] = Object.entries(activePlatform.metrics).map(([label, m]) => ({
            label,
            ...m,
          }));
          return (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
                <h2 className="text-[17px] font-bold">{activePlatform.name}</h2>
                <div className="flex flex-wrap items-center gap-2" data-report-hide>
                  <CopyAsReportButton businessId={activeBusinessId} />
                  <ExportPdfButton fileName={`detail-platform-${platform}`} businessId={activeBusinessId} />
                </div>
              </div>
              <PlatformKpiGrid entries={kpiEntries} />
              <PlatformTrendChart
                data={data.PLATFORM_TREND[platform]}
                color={PLATFORM_CHART_COLOR[platform]}
                label={activePlatform.name}
              />
            </>
          );
        })()
      )}
    </div>
  );
}
