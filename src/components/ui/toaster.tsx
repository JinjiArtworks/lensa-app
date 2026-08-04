"use client";

import { useUiStore } from "@/stores/ui";

export function Toaster() {
  const toast = useUiStore((s) => s.toast);

  return (
    <div
      className={`fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-lg bg-accent-text px-[18px] py-2.5 text-[12.5px] text-white transition-all duration-200 ${
        toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2.5 opacity-0"
      }`}
    >
      {toast}
    </div>
  );
}
