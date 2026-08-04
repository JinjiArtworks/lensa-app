import { create } from "zustand";

interface SyncState {
  lastSyncedAt: string;
  syncing: boolean;
  triggerSync: () => Promise<void>;
}

// Shared across Overview, Detail Platform, and AI Insight — syncing from
// any one of them updates "last synced" everywhere else too, instead of
// each page tracking its own disconnected fake timestamp.
export const useSyncStore = create<SyncState>((set, get) => ({
  lastSyncedAt: "12 menit lalu",
  syncing: false,
  triggerSync: () => {
    if (get().syncing) return Promise.resolve();
    set({ syncing: true });
    return new Promise((resolve) => {
      setTimeout(() => {
        set({ syncing: false, lastSyncedAt: "baru saja" });
        resolve();
      }, 1300);
    });
  },
}));
