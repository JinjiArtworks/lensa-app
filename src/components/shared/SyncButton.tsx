"use client";

import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSyncStore } from "@/stores/sync";
import { useUiStore } from "@/stores/ui";

export function SyncButton({ queryKey, label = "Sync" }: { queryKey: unknown[]; label?: string }) {
  const queryClient = useQueryClient();
  const showToast = useUiStore((s) => s.showToast);
  const { syncing, triggerSync } = useSyncStore();
  const isFetching = useIsFetching({ queryKey }) > 0;
  const busy = syncing || isFetching;

  async function handleSync() {
    await triggerSync();
    await queryClient.invalidateQueries({ queryKey });
    showToast("Data berhasil disinkronkan dari semua platform");
  }

  return (
    <Button disabled={busy} onClick={handleSync}>
      <RefreshCw className={`size-4 ${busy ? "animate-spin" : ""}`} />
      {busy ? "Syncing…" : label}
    </Button>
  );
}
