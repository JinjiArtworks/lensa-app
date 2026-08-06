"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FilterBar, initialFilterValue, type FilterPreset, type FilterValue } from "@/components/shared/FilterBar";
import { SyncButton } from "@/components/shared/SyncButton";
import { CopyAsReportButton } from "@/components/shared/CopyAsReportButton";
import type { ExportReportData } from "@/components/shared/ExportReportModal";
import { useProGate } from "@/components/shared/use-pro-gate";
import { ProUpgradeDialog } from "@/components/shared/ProUpgradeDialog";
import { useUiStore } from "@/stores/ui";
import { useSyncStore } from "@/stores/sync";
import { useOverviewData } from "@/features/overview-dashboard/api/use-overview-data";
import { PLATFORM_CHART_COLOR, PLATFORM_LABELS, type PlatformKey } from "@/features/overview-dashboard/mock-data";
import { PlatformSwitcher, type DetailPlatformView } from "@/features/detail-platform/components/PlatformSwitcher";
import { PlatformKpiGrid, type KpiEntry } from "@/features/detail-platform/components/PlatformKpiGrid";
import { PlatformTrendChart } from "@/features/detail-platform/components/PlatformTrendChart";
import { PlatformCampaignTable } from "@/features/detail-platform/components/PlatformCampaignTable";
import { useConnectedPlatforms, useSwitchPlatform } from "@/features/connect-platform/api/use-connect-platform";

const PLATFORM_KEYS = Object.keys(PLATFORM_LABELS) as PlatformKey[];
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
  const showToast = useUiStore((s) => s.showToast);
  const { lastSyncedAt } = useSyncStore();
  const [platform, setPlatform] = useState<DetailPlatformView>("meta");
  const [range, setRange] = useState<FilterValue>(initialFilterValue("year"));
  const rangeKey = range.preset === "custom" ? `custom:${range.from}:${range.to}` : range.preset;
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useOverviewData(activeBusinessId, rangeKey);
  const { isFree, isPlatformLocked } = useProGate(activeBusinessId);
  const { data: connectedPlatforms = [] } = useConnectedPlatforms(activeBusinessId);
  const switchPlatform = useSwitchPlatform(activeBusinessId);
  const [pendingSwitch, setPendingSwitch] = useState<DetailPlatformView | null>(null);
  const platformLimit = isFree ? 1 : PLATFORM_KEYS.length;

  // "Semua Platform" aggregates both platforms' seeded data regardless of
  // what's actually connected — gate it behind Pro like the 2nd platform
  // slot, otherwise a Free user sees data for a platform they never connected.
  function isViewLocked(key: DetailPlatformView): boolean {
    if (key === "all") return isFree;
    return isPlatformLocked(connectedPlatforms.includes(key), connectedPlatforms.length, platformLimit);
  }

  // Default view is "meta", but a Free user who swapped to TikTok-only would
  // otherwise land on a locked tab shown as active — snap to a connected
  // platform once Firestore's connectedPlatforms resolves.
  useEffect(() => {
    if (connectedPlatforms.length > 0 && platform !== "all" && !connectedPlatforms.includes(platform)) {
      setPlatform(connectedPlatforms[0] as PlatformKey);
    }
  }, [connectedPlatforms, platform]);

  function selectPlatform(key: DetailPlatformView) {
    if (isViewLocked(key)) {
      setPendingSwitch(key);
      return;
    }
    setPlatform(key);
  }

  function confirmSwitch() {
    if (!pendingSwitch || pendingSwitch === "all") return;
    const platformName = PLATFORM_LABELS[pendingSwitch].name;
    switchPlatform.mutate(pendingSwitch, {
      onSuccess: () => {
        setPlatform(pendingSwitch);
        setPendingSwitch(null);
        showToast(`Diganti ke ${platformName}`, "success");
      },
      onError: () => showToast(`Gagal ganti ke ${platformName}, coba lagi`, "error"),
    });
  }

  const currentPlatformNames = connectedPlatforms
    .map((key) => PLATFORM_LABELS[key as PlatformKey]?.name)
    .filter(Boolean)
    .join(", ");
  const pendingPlatformName = pendingSwitch && pendingSwitch !== "all" ? PLATFORM_LABELS[pendingSwitch].name : "";

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
          <div className="mt-0.5 text-xs text-ink-3">Drill-down performa per platform · data terakhir diperbarui {lastSyncedAt}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterBar defaultPreset="year" onChange={setRange} />
          <SyncButton queryKey={["platform-metrics", activeBusinessId, rangeKey]} />
        </div>
      </div>
      <PlatformSwitcher active={platform} onSelect={selectPlatform} isLocked={isViewLocked} />
      <ProUpgradeDialog
        open={pendingSwitch !== null}
        onOpenChange={(o) => !o && setPendingSwitch(null)}
        title={pendingSwitch === "all" ? "Buka Semua Platform?" : `Ganti ke ${pendingPlatformName}?`}
        description={
          pendingSwitch === "all" ? (
            <>
              Lihat performa gabungan semua platform sekaligus adalah fitur Pro. Plan Free cuma bisa lihat 1 platform
              aktif — upgrade buat buka tampilan ini.
            </>
          ) : (
            <>
              Plan Free cuma bisa lihat 1 platform aktif. Lanjut berarti <b>{currentPlatformNames}</b> diputus dan
              diganti dengan <b>{pendingPlatformName}</b>. Kalau mau pakai keduanya sekaligus, upgrade ke Pro.
            </>
          )
        }
        swapAction={
          pendingSwitch && pendingSwitch !== "all"
            ? {
                label: switchPlatform.isPending ? "Mengganti…" : `Ganti ke ${pendingPlatformName}`,
                pending: switchPlatform.isPending,
                onConfirm: confirmSwitch,
              }
            : undefined
        }
      />
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
