"use client";

import { useEffect, useState } from "react";
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
import { PLATFORM_LABELS } from "@/features/overview-dashboard/mock-data";
import { PlatformSwitcher, type PlatformKey } from "@/features/detail-platform/components/PlatformSwitcher";
import { PlatformKpiGrid } from "@/features/detail-platform/components/PlatformKpiGrid";
import { PlatformTrendChart } from "@/features/detail-platform/components/PlatformTrendChart";
import { PlatformCampaignTable } from "@/features/detail-platform/components/PlatformCampaignTable";
import { useConnectedPlatforms, useSwitchPlatform } from "@/features/connect-platform/api/use-connect-platform";

const PLATFORM_KEYS = Object.keys(PLATFORM_LABELS) as PlatformKey[];

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
  const [platform, setPlatform] = useState<PlatformKey>("meta");
  const [range, setRange] = useState<FilterValue>(initialFilterValue("year"));
  const rangeKey = range.preset === "custom" ? `custom:${range.from}:${range.to}` : range.preset;
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useOverviewData(activeBusinessId, rangeKey);
  const { isFree, isPlatformLocked } = useProGate(activeBusinessId);
  const { data: connectedPlatforms = [] } = useConnectedPlatforms(activeBusinessId);
  const switchPlatform = useSwitchPlatform(activeBusinessId);
  const [pendingSwitch, setPendingSwitch] = useState<PlatformKey | null>(null);
  const platformLimit = isFree ? 1 : PLATFORM_KEYS.length;

  // Default tab is "meta", but a Free user who swapped to TikTok-only would
  // otherwise land on a locked tab shown as active — snap to a connected
  // platform once Firestore's connectedPlatforms resolves.
  useEffect(() => {
    if (connectedPlatforms.length > 0 && !connectedPlatforms.includes(platform)) {
      setPlatform(connectedPlatforms[0] as PlatformKey);
    }
  }, [connectedPlatforms, platform]);

  function selectPlatform(key: PlatformKey) {
    if (isPlatformLocked(connectedPlatforms.includes(key), connectedPlatforms.length, platformLimit)) {
      setPendingSwitch(key);
      return;
    }
    setPlatform(key);
  }

  function confirmSwitch() {
    if (!pendingSwitch) return;
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
  const pendingPlatformName = pendingSwitch ? PLATFORM_LABELS[pendingSwitch].name : "";

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
      <PlatformSwitcher
        active={platform}
        onSelect={selectPlatform}
        isLocked={(key) => isPlatformLocked(connectedPlatforms.includes(key), connectedPlatforms.length, platformLimit)}
      />
      <ProUpgradeDialog
        open={pendingSwitch !== null}
        onOpenChange={(o) => !o && setPendingSwitch(null)}
        title={`Ganti ke ${pendingPlatformName}?`}
        description={
          <>
            Plan Free cuma bisa lihat 1 platform aktif. Lanjut berarti <b>{currentPlatformNames}</b> diputus dan
            diganti dengan <b>{pendingPlatformName}</b>. Kalau mau pakai keduanya sekaligus, upgrade ke Pro.
          </>
        }
        swapAction={{
          label: switchPlatform.isPending ? "Mengganti…" : `Ganti ke ${pendingPlatformName}`,
          pending: switchPlatform.isPending,
          onConfirm: confirmSwitch,
        }}
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
