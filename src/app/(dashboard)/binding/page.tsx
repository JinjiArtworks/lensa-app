"use client";

import { PlatformConnectionList } from "@/features/binding/components/PlatformConnectionList";
import { useProGate } from "@/components/shared/use-pro-gate";

export default function BindingPage() {
  const { isFree } = useProGate();

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-[23px] font-extrabold tracking-tight">Binding</h1>
        <div className="mt-0.5 text-xs text-ink-3">
          {isFree
            ? "Plan Free — bisa binding 1 platform iklan (Meta Ads atau TikTok Ads), permanen sampai upgrade"
            : "Plan Pro — Meta Ads & TikTok Ads bisa di-binding sekaligus sebagai platform inti"}
        </div>
      </div>
      <PlatformConnectionList />
    </div>
  );
}
