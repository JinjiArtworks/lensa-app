"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportReportModal } from "@/components/shared/ExportReportModal";
import { useUiStore } from "@/stores/ui";
import { useSyncStore } from "@/stores/sync";
import { useOverviewData } from "@/features/overview-dashboard/api/use-overview-data";
import { PlatformSwitcher, type PlatformKey } from "@/features/detail-platform/components/PlatformSwitcher";
import { PlatformKpiGrid } from "@/features/detail-platform/components/PlatformKpiGrid";
import { PlatformTrendChart } from "@/features/detail-platform/components/PlatformTrendChart";
import { PlatformCampaignTable } from "@/features/detail-platform/components/PlatformCampaignTable";

export default function DetailPlatformPage() {
  const showToast = useUiStore((s) => s.showToast);
  const activeBusinessId = useUiStore((s) => s.activeBusinessId) ?? undefined;
  const { lastSyncedAt, syncing, triggerSync } = useSyncStore();
  const [platform, setPlatform] = useState<PlatformKey>("meta");
  const [exportOpen, setExportOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useOverviewData(activeBusinessId);

  async function handleSync() {
    await triggerSync();
    await queryClient.invalidateQueries({ queryKey: ["platform-metrics", activeBusinessId] });
    showToast("Data berhasil disinkronkan dari semua platform");
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[23px] font-extrabold tracking-tight">Detail Platform</h1>
          <div className="mt-0.5 text-xs text-ink-3">Drill-down performa per platform · data terakhir diperbarui {lastSyncedAt}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" disabled={syncing} onClick={handleSync}>
            <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync"}
          </Button>
          <Button variant="ghost" onClick={() => setExportOpen(true)}>
            <ClipboardCheck className="size-4" />
            Copy as report
          </Button>
        </div>
      </div>
      <PlatformSwitcher active={platform} onSelect={setPlatform} />
      {isLoading || !data ? (
        <div className="py-10 text-center text-xs text-ink-3">Memuat data platform…</div>
      ) : isError ? (
        <div className="py-10 text-center text-xs text-red">
          Gagal memuat data platform.{" "}
          <button
            type="button"
            className="font-bold underline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["platform-metrics", activeBusinessId] })}
          >
            Coba lagi
          </button>
        </div>
      ) : (
        (() => {
          const activePlatform = data.PLATFORMS[platform];
          return (
            <>
              <h2 className="mb-3 text-[17px] font-bold">{activePlatform.name}</h2>
              <PlatformKpiGrid platformKey={platform} platforms={data.PLATFORMS} />
              <PlatformTrendChart platformKey={platform} />
              <PlatformCampaignTable platformKey={platform} />
              <ExportReportModal
                open={exportOpen}
                onClose={() => setExportOpen(false)}
                data={{
                  scope: activePlatform.name,
                  roas: `${activePlatform.metrics.ROAS.value} ROAS`,
                  spend: activePlatform.metrics.Spend.value,
                  closing: activePlatform.metrics.Closing.value,
                  note: `Performa ${activePlatform.name} 30 hari terakhir — cek tab Campaign untuk breakdown per campaign.`,
                }}
              />
            </>
          );
        })()
      )}
    </div>
  );
}
