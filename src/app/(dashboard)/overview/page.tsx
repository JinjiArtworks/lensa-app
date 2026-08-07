"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { FilterBar, initialFilterValue, type FilterValue } from "@/components/shared/FilterBar";
import { SyncButton } from "@/components/shared/SyncButton";
import { useUiStore } from "@/stores/ui";
import { useSyncStore } from "@/stores/sync";
import { KpiGrid } from "@/features/overview-dashboard/components/KpiGrid";
import { TargetTracker } from "@/features/overview-dashboard/components/TargetTracker";
import { ProactiveAlertCard } from "@/features/overview-dashboard/components/ProactiveAlertCard";
import { ChannelChart } from "@/features/overview-dashboard/components/ChannelChart";
import { TrendChart } from "@/features/overview-dashboard/components/TrendChart";
import { PlatformShareChart } from "@/features/overview-dashboard/components/PlatformShareChart";
import { PlatformEfficiencyChart } from "@/features/overview-dashboard/components/PlatformEfficiencyChart";
import { useOverviewData } from "@/features/overview-dashboard/api/use-overview-data";
import { useConnectedPlatforms } from "@/features/binding/api/use-connect-platform";

// Lazy: all 3 read Firestore directly (real connectedPlatforms/plan, not the
// mocked metrics API) — keeping them out of the main chunk avoids pulling the
// Firestore SDK into Overview's initial JS (same reasoning as
// NavAccountActions.tsx on the landing page).
const CoverageBanner = dynamic(() =>
  import("@/features/overview-dashboard/components/CoverageBanner").then((m) => m.CoverageBanner)
);
const CopyAsReportButton = dynamic(() =>
  import("@/components/shared/CopyAsReportButton").then((m) => m.CopyAsReportButton)
);
const ExportPdfButton = dynamic(() => import("@/components/shared/ExportPdfButton").then((m) => m.ExportPdfButton));

export default function OverviewPage() {
  const activeBusinessId = useUiStore((s) => s.activeBusinessId) ?? undefined;
  const { lastSyncedAt } = useSyncStore();
  const [range, setRange] = useState<FilterValue>(initialFilterValue("year"));
  const rangeKey = range.preset === "custom" ? `custom:${range.from}:${range.to}` : range.preset;
  const queryClient = useQueryClient();
  const { data: connectedPlatforms = [] } = useConnectedPlatforms(activeBusinessId);
  const { data, isLoading, isError } = useOverviewData(activeBusinessId, rangeKey, connectedPlatforms);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight">Dashboard</h1>
          <div className="mt-0.5 text-xs text-ink-3">Toko Baju Sinta · data terakhir diperbarui {lastSyncedAt}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2" data-report-hide>
          <FilterBar defaultPreset="year" onChange={setRange} />
          <SyncButton queryKey={["platform-metrics", activeBusinessId, rangeKey]} />
          <CopyAsReportButton disabled={!data} businessId={activeBusinessId} />
          <ExportPdfButton fileName="overview" disabled={!data} businessId={activeBusinessId} />
        </div>
      </div>
      <CoverageBanner />
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
        <>
          <KpiGrid kpiRow1={data.KPI_ROW_1} kpiRow2={data.KPI_ROW_2} />
          <TargetTracker actuals={data.ACTUALS} />
          <ProactiveAlertCard platforms={data.PLATFORMS} />
          <div className="mb-4 grid grid-cols-2 gap-3.5 max-[980px]:grid-cols-1">
            <ChannelChart chartData={data.CHANNEL_CHART_DATA} />
            <TrendChart trendData={data.TREND_DATA} />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-3.5 max-[980px]:grid-cols-1">
            <PlatformShareChart chartData={data.CHANNEL_CHART_DATA} />
            <PlatformEfficiencyChart chartData={data.EFFICIENCY_CHART_DATA} />
          </div>
        </>
      )}
    </div>
  );
}
