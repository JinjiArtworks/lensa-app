"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FilterBar, presetRange, type FilterValue } from "@/components/shared/FilterBar";
import { SyncButton } from "@/components/shared/SyncButton";
import { CopyAsReportButton } from "@/components/shared/CopyAsReportButton";
import type { ExportReportData } from "@/components/shared/ExportReportModal";
import { useUiStore } from "@/stores/ui";
import { useSyncStore } from "@/stores/sync";
import { KpiGrid } from "@/features/overview-dashboard/components/KpiGrid";
import { CoverageBanner } from "@/features/overview-dashboard/components/CoverageBanner";
import { TargetTracker } from "@/features/overview-dashboard/components/TargetTracker";
import { ProactiveAlertCard } from "@/features/overview-dashboard/components/ProactiveAlertCard";
import { ChannelChart } from "@/features/overview-dashboard/components/ChannelChart";
import { TrendChart } from "@/features/overview-dashboard/components/TrendChart";
import { CampaignTable } from "@/features/overview-dashboard/components/CampaignTable";
import { useOverviewData } from "@/features/overview-dashboard/api/use-overview-data";

export default function OverviewPage() {
  const activeBusinessId = useUiStore((s) => s.activeBusinessId) ?? undefined;
  const { lastSyncedAt } = useSyncStore();
  const [range, setRange] = useState<FilterValue>({ preset: "year", ...presetRange("year") });
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useOverviewData(activeBusinessId, range.preset);

  const reportData: ExportReportData = data
    ? {
        scope: "Semua Platform",
        roas: `${data.KPI_ROW_1[2].value} ROAS`,
        spend: data.KPI_ROW_1[0].value,
        closing: data.KPI_ROW_1[1].value,
        note: "ROAS periode ini sedikit menurun — pertimbangkan review targeting & creative minggu depan.",
      }
    : { scope: "", roas: "", spend: "", closing: "", note: "" };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight">Dashboard</h1>
          <div className="mt-0.5 text-xs text-ink-3">Toko Baju Sinta · data terakhir diperbarui {lastSyncedAt}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterBar defaultPreset="year" onChange={setRange} />
          <SyncButton queryKey={["platform-metrics", activeBusinessId, range.preset]} />
          <CopyAsReportButton data={reportData} disabled={!data} />
        </div>
      </div>
      <CoverageBanner />
      {isLoading || !data ? (
        <div className="py-10 text-center text-xs text-ink-3">Memuat data platform…</div>
      ) : isError ? (
        <div className="py-10 text-center text-xs text-red">
          Gagal memuat data platform.{" "}
          <button
            type="button"
            className="font-bold underline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["platform-metrics", activeBusinessId, range.preset] })}
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <>
          <KpiGrid kpiRow1={data.KPI_ROW_1} kpiRow2={data.KPI_ROW_2} />
          <TargetTracker actuals={data.ACTUALS} />
          <ProactiveAlertCard platforms={data.PLATFORMS} />
          <div className="mb-4 grid grid-cols-2 gap-3.5 max-[980px]:grid-cols-1">
            <ChannelChart chartData={data.CHANNEL_CHART_DATA} />
            <TrendChart trendData={data.TREND_DATA} />
          </div>
          <CampaignTable campaigns={data.CAMPAIGNS} creatives={data.CREATIVES} />
        </>
      )}
    </div>
  );
}
