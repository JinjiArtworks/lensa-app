"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { FilterBar, initialFilterValue, type FilterValue } from "@/components/shared/FilterBar";
import { SyncButton } from "@/components/shared/SyncButton";
import { CopyAsReportButton } from "@/components/shared/CopyAsReportButton";
import { ExportPdfButton } from "@/components/shared/ExportPdfButton";
import { useUiStore } from "@/stores/ui";
import { useSyncStore } from "@/stores/sync";
import { KpiGrid } from "@/features/overview-dashboard/components/KpiGrid";
import { TargetTracker } from "@/features/overview-dashboard/components/TargetTracker";
import { ProactiveAlertCard } from "@/features/overview-dashboard/components/ProactiveAlertCard";
import { ChannelChart } from "@/features/overview-dashboard/components/ChannelChart";
import { TrendChart } from "@/features/overview-dashboard/components/TrendChart";
import { PlatformShareChart } from "@/features/overview-dashboard/components/PlatformShareChart";
import { CampaignTable } from "@/features/overview-dashboard/components/CampaignTable";
import { useOverviewData } from "@/features/overview-dashboard/api/use-overview-data";

// Lazy: this is the only thing on the page that reads Firestore directly
// (real connectedPlatforms, not the mocked metrics API) — keeping it out of
// the main chunk avoids pulling the Firestore SDK into Overview's initial JS
// (same reasoning as NavAccountActions.tsx on the landing page).
const CoverageBanner = dynamic(() =>
  import("@/features/overview-dashboard/components/CoverageBanner").then((m) => m.CoverageBanner)
);

export default function OverviewPage() {
  const activeBusinessId = useUiStore((s) => s.activeBusinessId) ?? undefined;
  const { lastSyncedAt } = useSyncStore();
  const [range, setRange] = useState<FilterValue>(initialFilterValue("year"));
  const rangeKey = range.preset === "custom" ? `custom:${range.from}:${range.to}` : range.preset;
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useOverviewData(activeBusinessId, rangeKey);

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
          <CopyAsReportButton disabled={!data} />
          <ExportPdfButton fileName="overview" disabled={!data} />
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
          <div className="mb-4">
            <PlatformShareChart chartData={data.CHANNEL_CHART_DATA} />
          </div>
          <CampaignTable campaigns={data.CAMPAIGNS} creatives={data.CREATIVES} />
        </>
      )}
    </div>
  );
}
