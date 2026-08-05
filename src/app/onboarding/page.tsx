"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Lock, LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { useLogout } from "@/features/auth/use-logout";
import { useUserProfile } from "@/features/auth/api/use-user-profile";
import {
  useBusinessPlan,
  useConnectPlatform,
  useConnectedPlatforms,
  useSwitchPlatform,
} from "@/features/connect-platform/api/use-connect-platform";

const PLATFORMS = [
  { key: "meta", name: "Meta Ads", sub: "Facebook & Instagram Ads", ic: "M" },
  { key: "tiktok", name: "TikTok Ads", sub: "TikTok for Business", ic: "TT" },
] as const;

type PlatformKey = (typeof PLATFORMS)[number]["key"];

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function OnboardingPage() {
  const authUser = useAuthStore((s) => s.user);
  const { data: profile } = useUserProfile(authUser?.uid);
  const activeBusinessId = useUiStore((s) => s.activeBusinessId) ?? undefined;
  const showToast = useUiStore((s) => s.showToast);
  const { data: plan = "free" } = useBusinessPlan(activeBusinessId);
  const { data: connectedPlatforms = [] } = useConnectedPlatforms(activeBusinessId);
  const connectPlatform = useConnectPlatform(activeBusinessId);
  const switchPlatform = useSwitchPlatform(activeBusinessId);
  const [connecting, setConnecting] = useState<PlatformKey | null>(null);
  const [pendingSwitch, setPendingSwitch] = useState<PlatformKey | null>(null);
  const router = useRouter();
  const logout = useLogout();

  const isFree = plan === "free";
  const platformLimit = isFree ? 1 : PLATFORMS.length;
  const limitReached = connectedPlatforms.length >= platformLimit;

  const name = profile?.name ?? authUser?.email?.split("@")[0] ?? "Pengguna";
  const email = authUser?.email ?? "";

  function connect(key: PlatformKey) {
    if (connectedPlatforms.includes(key) || connecting) return;
    if (limitReached) {
      setPendingSwitch(key);
      return;
    }
    const platformName = PLATFORMS.find((p) => p.key === key)?.name ?? key;
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
    const platformName = PLATFORMS.find((p) => p.key === pendingSwitch)?.name ?? pendingSwitch;
    switchPlatform.mutate(pendingSwitch, {
      onSuccess: () => {
        setPendingSwitch(null);
        showToast(`Diganti ke ${platformName}`, "success");
      },
      onError: () => showToast(`Gagal ganti ke ${platformName}, coba lagi`, "error"),
    });
  }

  const anyConnected = connectedPlatforms.length > 0;
  const currentPlatformNames = PLATFORMS.filter((p) => connectedPlatforms.includes(p.key))
    .map((p) => p.name)
    .join(", ");
  const pendingPlatformName = PLATFORMS.find((p) => p.key === pendingSwitch)?.name ?? "";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12 text-center">
      <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-accent text-base font-extrabold text-ink">
        L
      </div>
      <h2 className="mb-1.5 text-[19px] font-extrabold">Halo — hubungkan platform iklanmu</h2>
      <p className="mb-5 max-w-[400px] text-[13px] text-ink-3">
        {isFree ? (
          <>
            Plan Free kamu bisa hubungkan <b className="text-ink-2">1 platform</b> (pilih salah satu). Upgrade ke Pro
            buat hubungkan semuanya sekaligus.
          </>
        ) : (
          <>Sesuai plan Pro, kamu bisa hubungkan Meta Ads &amp; TikTok Ads sebagai platform inti.</>
        )}
      </p>

      <div className="mb-6 flex w-full max-w-[420px] items-center gap-3 rounded-xl border border-line bg-card p-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-[#ffe27a] text-[13px] font-bold text-ink">
          {initialsOf(name)}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-bold">{name}</span>
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[9.5px] font-extrabold ${
                isFree ? "bg-gray-bg text-ink-2" : "bg-accent text-ink"
              }`}
            >
              {isFree ? "Free" : "Pro"}
            </span>
          </div>
          <div className="truncate text-[11.5px] text-ink-3">{email}</div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-2 hover:border-red hover:text-red"
        >
          <LogOut className="size-3.5" />
          Keluar
        </button>
      </div>

      <div className="mb-5 flex w-full max-w-[420px] flex-col gap-2.5 text-left">
        {PLATFORMS.map((p) => {
          const isDone = connectedPlatforms.includes(p.key);
          const isConnecting = connecting === p.key;
          const isLocked = !isDone && limitReached;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => connect(p.key)}
              title={isLocked ? "Ganti ke platform ini, atau upgrade ke Pro buat pakai keduanya" : undefined}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                isDone
                  ? "border-2 border-green bg-green-bg"
                  : isLocked
                    ? "border-line bg-gray-bg opacity-60"
                    : "border-line bg-card hover:border-accent"
              }`}
            >
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-[11.5px] font-bold ${
                  isDone ? "bg-green text-white" : "bg-gray-bg text-ink-2"
                }`}
              >
                {p.ic}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-bold">{p.name}</div>
                <div className="mt-0.5 text-[11.5px] text-ink-3">
                  {isLocked ? "Klik buat ganti, atau upgrade ke Pro" : p.sub}
                </div>
              </div>
              {isConnecting ? (
                <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-line border-t-accent" />
              ) : isLocked ? (
                <Lock className="size-4 shrink-0 text-ink-3" />
              ) : (
                <div
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    isDone ? "border-green bg-green" : "border-line"
                  }`}
                >
                  {isDone && <Check className="size-3.5 text-white" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mb-5 text-xs text-ink-3">
        {isFree
          ? "Plan Free — hubungkan 1 platform buat lanjut. Mau hubungkan lebih dari 1? Upgrade ke Pro."
          : "Plan Pro — hubungkan minimal 1 platform buat lanjut, bisa tambah platform lain kapan saja"}
      </div>

      <button
        type="button"
        disabled={!anyConnected}
        onClick={() => router.push("/overview")}
        className="rounded-lg bg-accent px-5 py-2.5 text-[12.5px] font-bold text-ink disabled:opacity-45"
      >
        Lanjut ke dashboard
      </button>

      <Dialog open={pendingSwitch !== null} onOpenChange={(o) => !o && setPendingSwitch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ganti ke {pendingPlatformName}?</DialogTitle>
          </DialogHeader>
          <p className="mb-4 text-[12.5px] leading-relaxed text-ink-2">
            Plan Free cuma bisa 1 platform aktif. Lanjut berarti <b>{currentPlatformNames}</b> diputus dan diganti
            dengan <b>{pendingPlatformName}</b>. Kalau mau pakai keduanya sekaligus, upgrade ke Pro.
          </p>
          <div className="flex flex-col gap-2">
            <Button disabled={switchPlatform.isPending} onClick={confirmSwitch} className="w-full justify-center">
              {switchPlatform.isPending ? "Mengganti…" : `Ganti ke ${pendingPlatformName}`}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={() => {
                setPendingSwitch(null);
                router.push("/billing");
              }}
            >
              Upgrade ke Pro
            </Button>
            <Button variant="ghost" className="w-full justify-center" onClick={() => setPendingSwitch(null)}>
              Batal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
