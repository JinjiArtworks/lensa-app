"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import { ProLockBadge } from "@/components/shared/ProLockBadge";
import { ProUpgradeDialog } from "@/components/shared/ProUpgradeDialog";
import { useProGate } from "@/components/shared/use-pro-gate";
import { useUiStore } from "@/stores/ui";
import { PLATFORM_LABELS, type PlatformKey } from "@/features/overview-dashboard/mock-data";
import { useConnectPlatform, useConnectedPlatforms } from "@/features/binding/api/use-connect-platform";

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
  const [connecting, setConnecting] = useState<PlatformKey | null>(null);
  const [pendingBind, setPendingBind] = useState<PlatformKey | null>(null);
  const [pendingUpgrade, setPendingUpgrade] = useState<PlatformKey | null>(null);
  const platformLimit = isFree ? 1 : PLATFORM_KEYS.length;

  function requestBind(key: PlatformKey) {
    if (connectedPlatforms.includes(key) || connecting) return;
    if (isPlatformLocked(false, connectedPlatforms.length, platformLimit)) {
      setPendingUpgrade(key);
      return;
    }
    setPendingBind(key);
  }

  function confirmBind() {
    if (!pendingBind) return;
    const key = pendingBind;
    const platformName = PLATFORM_LABELS[key].name;
    setPendingBind(null);
    setConnecting(key);
    setTimeout(() => {
      connectPlatform.mutate(key, {
        onSettled: () => setConnecting(null),
        onSuccess: () => showToast(`${platformName} terhubung`, "success"),
        onError: () => showToast(`Gagal menghubungkan ${platformName}, coba lagi`, "error"),
      });
    }, 1100);
  }

  const currentPlatformNames = connectedPlatforms
    .map((key) => PLATFORM_LABELS[key as PlatformKey]?.name)
    .filter(Boolean)
    .join(", ");
  const pendingUpgradeName = pendingUpgrade ? PLATFORM_LABELS[pendingUpgrade].name : "";
  const pendingBindName = pendingBind ? PLATFORM_LABELS[pendingBind].name : "";

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
                  {isLocked ? "Terkunci di plan Free — upgrade ke Pro buat hubungkan ini juga" : PLATFORM_SUB[key]}
                </div>
              </div>
              {isConnecting ? (
                <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-line border-t-accent" />
              ) : isConnected ? (
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-green bg-green">
                  <Check className="size-3.5 text-white" />
                </div>
              ) : isLocked ? (
                <ProLockBadge tooltip="Terkunci — upgrade ke Pro buat hubungkan platform ini juga" />
              ) : (
                <button
                  type="button"
                  onClick={() => requestBind(key)}
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
                onClick={() => setPendingUpgrade(key)}
                className="mt-2.5 w-full rounded-lg border border-line py-1.5 text-[11px] font-semibold text-ink-2"
              >
                Upgrade ke Pro buat buka
              </button>
            )}
          </div>
        );
      })}

      <Dialog open={pendingBind !== null} onOpenChange={(o) => !o && setPendingBind(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Binding ke {pendingBindName}?</DialogTitle>
          </DialogHeader>
          <p className="mb-4 text-[12.5px] leading-relaxed text-ink-2">
            {isFree ? (
              <>
                Simulasi menghubungkan akun <b>{pendingBindName}</b> ke Lensa. Plan Free — sekali binding, permanen
                sampai kamu upgrade ke Pro.
              </>
            ) : (
              <>
                Simulasi menghubungkan akun <b>{pendingBindName}</b> ke Lensa.
              </>
            )}
          </p>
          <div className="flex flex-col gap-2">
            <Button className="w-full justify-center" onClick={confirmBind}>
              Ya, Binding
            </Button>
            <Button variant="ghost" className="w-full justify-center" onClick={() => setPendingBind(null)}>
              Batal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ProUpgradeDialog
        open={pendingUpgrade !== null}
        onOpenChange={(o) => !o && setPendingUpgrade(null)}
        title={`${pendingUpgradeName} terkunci`}
        description={
          <>
            Plan Free cuma bisa 1 platform aktif, dan pilihan itu terkunci permanen setelah connect — kamu udah
            connect <b>{currentPlatformNames}</b>. Upgrade ke Pro buat hubungkan <b>{pendingUpgradeName}</b> juga
            tanpa lepas yang sekarang.
          </>
        }
      />
    </div>
  );
}
