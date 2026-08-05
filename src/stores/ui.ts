import { create } from "zustand";

export type ToastVariant = "success" | "error";

interface UiState {
  activeBusinessId: string | null;
  setActiveBusinessId: (id: string | null) => void;
  toast: string | null;
  toastVariant: ToastVariant;
  showToast: (message: string, variant?: ToastVariant) => void;
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
}));
