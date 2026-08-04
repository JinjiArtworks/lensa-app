import { create } from "zustand";

interface UiState {
  activeBusinessId: string | null;
  setActiveBusinessId: (id: string) => void;
  toast: string | null;
  showToast: (message: string) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useUiStore = create<UiState>((set) => ({
  activeBusinessId: null,
  setActiveBusinessId: (id) => set({ activeBusinessId: id }),
  toast: null,
  showToast: (message) => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: message });
    toastTimer = setTimeout(() => set({ toast: null }), 1800);
  },
}));
