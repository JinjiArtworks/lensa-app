import { create } from "zustand";

export type ToastVariant = "success" | "error";

// Structurally identical to detail-platform's DetailPlatformView — kept as a
// plain literal union here (not imported) so this cross-cutting store stays
// free of feature-folder imports.
export type DetailPlatformView = "all" | "meta" | "tiktok";

interface UiState {
  activeBusinessId: string | null;
  setActiveBusinessId: (id: string | null) => void;
  toast: string | null;
  toastVariant: ToastVariant;
  showToast: (message: string, variant?: ToastVariant) => void;
  // Sidebar's Detail Platform submenu and the /detail page share this so the
  // sidebar can drive which platform's data the page renders.
  detailPlatformView: DetailPlatformView;
  setDetailPlatformView: (v: DetailPlatformView) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useUiStore = create<UiState>((set) => ({
  activeBusinessId: null,
  setActiveBusinessId: (id) => set({ activeBusinessId: id }),
  toast: null,
  toastVariant: "success",
  showToast: (message, variant = "success") => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: message, toastVariant: variant });
    toastTimer = setTimeout(() => set({ toast: null }), 1800);
  },
  detailPlatformView: "meta",
  setDetailPlatformView: (v) => set({ detailPlatformView: v }),
}));
