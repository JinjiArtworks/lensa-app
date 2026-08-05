"use client";

import { useUiStore } from "@/stores/ui";

export function Toaster() {
  const toast = useUiStore((s) => s.toast);
  const variant = useUiStore((s) => s.toastVariant);

  return (
    <div
      className={`fixed left-1/2 top-5 z-[70] -translate-x-1/2 rounded-lg px-[18px] py-2.5 text-[12.5px] text-white shadow-lg transition-all duration-200 ${
        variant === "error" ? "bg-red" : "bg-accent-text"
      } ${toast ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2.5 opacity-0"}`}
    >
      {toast}
    </div>
  );
}
