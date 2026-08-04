"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useUiStore } from "@/stores/ui";
import { useConnectPlatform, useConnectedPlatforms } from "@/features/connect-platform/api/use-connect-platform";

const PLATFORMS = [
  { key: "meta", name: "Meta Ads", sub: "Facebook & Instagram Ads", ic: "M" },
  { key: "tiktok", name: "TikTok Ads", sub: "TikTok for Business", ic: "TT" },
] as const;

type PlatformKey = (typeof PLATFORMS)[number]["key"];

export default function OnboardingPage() {
  const activeBusinessId = useUiStore((s) => s.activeBusinessId) ?? undefined;
  const { data: connectedPlatforms = [] } = useConnectedPlatforms(activeBusinessId);
  const connectPlatform = useConnectPlatform(activeBusinessId);
  const [connecting, setConnecting] = useState<PlatformKey | null>(null);
  const router = useRouter();

  function connect(key: PlatformKey) {
    if (connectedPlatforms.includes(key) || connecting) return;
    setConnecting(key);
    setTimeout(() => {
      connectPlatform.mutate(key, { onSettled: () => setConnecting(null) });
    }, 1100);
  }

  const anyConnected = connectedPlatforms.length > 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12 text-center">
      <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-accent text-base font-extrabold text-ink">
        L
      </div>
      <h2 className="mb-1.5 text-[19px] font-extrabold">Halo, Sinta — hubungkan platform iklanmu</h2>
      <p className="mb-6 max-w-[400px] text-[13px] text-ink-3">
        Sesuai plan Pro, kamu bisa hubungkan Meta Ads &amp; TikTok Ads sebagai platform inti. Klik salah satu buat
        mulai.
      </p>

      <div className="mb-5 flex w-full max-w-[420px] flex-col gap-2.5 text-left">
        {PLATFORMS.map((p) => {
          const isDone = connectedPlatforms.includes(p.key);
          const isConnecting = connecting === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => connect(p.key)}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                isDone ? "border-2 border-green bg-green-bg" : "border-line bg-card hover:border-accent"
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
                <div className="mt-0.5 text-[11.5px] text-ink-3">{p.sub}</div>
              </div>
              {isConnecting ? (
                <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-line border-t-accent" />
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
        Plan Pro — hubungkan minimal 1 platform buat lanjut, bisa tambah platform lain kapan saja
      </div>

      <button
        type="button"
        disabled={!anyConnected}
        onClick={() => router.push("/overview")}
        className="rounded-lg bg-accent px-5 py-2.5 text-[12.5px] font-bold text-ink disabled:opacity-45"
      >
        Lanjut ke dashboard
      </button>
    </div>
  );
}
