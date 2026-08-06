"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import { ProLockBadge } from "@/components/shared/ProLockBadge";
import { ProUpgradeDialog } from "@/components/shared/ProUpgradeDialog";
import { useProGate } from "@/components/shared/use-pro-gate";
import { useUiStore } from "@/stores/ui";
import { PLATFORM_LABELS, type PlatformKey } from "@/features/overview-dashboard/mock-data";
import {
  useConnectPlatform,
  useConnectedPlatforms,
  useSwitchPlatform,
} from "@/features/connect-platform/api/use-connect-platform";

const PLATFORM_SUB: Record<PlatformKey, string> = {
  meta: "Facebook & Instagram Ads",
  tiktok: "TikTok for Business",
};

const PLATFORM_KEYS = Object.keys(PLATFORM_LABELS) as PlatformKey[];

export function PlatformConnectionList() {
  const activeBusinessId = useUiStore((s) => s.activeBusinessId) ?? undefined;
  const showToast = useUiStore((s) => s.showToast);
  const { isFree, isPlatformLocked } = useProGate(activeBusinessId);
  const { data: connectedPlatforms = [] } = useConnectedPlatforms(activeBusinessId);
  const connectPlatform = useConnectPlatform(activeBusinessId);
  const switchPlatform = useSwitchPlatform(activeBusinessId);
  const [connecting, setConnecting] = useState<PlatformKey | null>(null);
  const [pendingSwitch, setPendingSwitch] = useState<PlatformKey | null>(null);
  const platformLimit = isFree ? 1 : PLATFORM_KEYS.length;

  function connect(key: PlatformKey) {
    if (connectedPlatforms.includes(key) || connecting) return;
    if (isPlatformLocked(false, connectedPlatforms.length, platformLimit)) {
      setPendingSwitch(key);
      return;
    }
    const platformName = PLATFORM_LABELS[key].name;
    setConnecting(key);
    setTimeout(() => {
      connectPlatform.mutate(key, {
        onSettled: () => setConnecting(null),
        onSuccess: () => showToast(`${platformName} terhubung`, "success"),
        onError: () => showToast(`Gagal menghubungkan ${platformName}, coba lagi`, "error"),
      });
    }, 1100);
  }

  function confirmSwitch() {
    if (!pendingSwitch) return;
    const platformName = PLATFORM_LABELS[pendingSwitch].name;
    switchPlatform.mutate(pendingSwitch, {
      onSuccess: () => {
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
    <div className="flex max-w-[480px] flex-col gap-2.5">
      {PLATFORM_KEYS.map((key) => {
        const p = PLATFORM_LABELS[key];
        const isConnected = connectedPlatforms.includes(key);
        const isConnecting = connecting === key;
        const isLocked = isPlatformLocked(isConnected, connectedPlatforms.length, platformLimit);

        return (
          <div
            key={key}
            className={`rounded-xl border-2 p-3.5 ${
              isConnected
                ? "border-green bg-green-bg"
                : isLocked
                  ? "border-line bg-gray-bg opacity-70"
                  : "border-line bg-card"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                  isConnected ? "bg-green text-white" : "bg-gray-bg text-ink-2"
                }`}
              >
                <PlatformIcon platformKey={key} className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-bold">{p.name}</div>
                <div className="mt-0.5 text-[11.5px] text-ink-3">
                  {isLocked ? "Klik buat ganti, atau upgrade ke Pro" : PLATFORM_SUB[key]}
                </div>
              </div>
              {isConnecting ? (
                <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-line border-t-accent" />
              ) : isConnected ? (
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-green bg-green">
                  <Check className="size-3.5 text-white" />
                </div>
              ) : isLocked ? (
                <ProLockBadge tooltip="Ganti ke platform ini, atau upgrade ke Pro buat pakai keduanya" />
              ) : (
                <button
                  type="button"
                  onClick={() => connect(key)}
                  className="shrink-0 rounded-lg bg-accent px-2.5 py-1.5 text-[11px] font-bold text-ink"
                >
                  Hubungkan
                </button>
              )}
            </div>
            {isConnected && <div className="mt-2.5 text-[11px] text-ink-3">Terakhir sync: baru saja</div>}
            {isLocked && (
              <button
                type="button"
                onClick={() => setPendingSwitch(key)}
                className="mt-2.5 w-full rounded-lg border border-line py-1.5 text-[11px] font-semibold text-ink-2"
              >
                Ganti ke platform ini
              </button>
            )}
          </div>
        );
      })}

      <ProUpgradeDialog
        open={pendingSwitch !== null}
        onOpenChange={(o) => !o && setPendingSwitch(null)}
        title={`Ganti ke ${pendingPlatformName}?`}
        description={
          <>
            Plan Free cuma bisa 1 platform aktif. Lanjut berarti <b>{currentPlatformNames}</b> diputus dan diganti
            dengan <b>{pendingPlatformName}</b>. Kalau mau pakai keduanya sekaligus, upgrade ke Pro.
          </>
        }
        swapAction={{
          label: switchPlatform.isPending ? "Mengganti…" : `Ganti ke ${pendingPlatformName}`,
          pending: switchPlatform.isPending,
          onConfirm: confirmSwitch,
        }}
      />
    </div>
  );
}
