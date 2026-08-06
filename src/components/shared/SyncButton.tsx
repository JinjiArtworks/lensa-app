"use client";

import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSyncStore } from "@/stores/sync";
import { useUiStore } from "@/stores/ui";

export function SyncButton({
  queryKey,
  label = "Sync",
  onSynced,
}: {
  queryKey: unknown[];
  label?: string;
  // Optional hook for callers that want their own post-sync effect (e.g. AI
  // Insight surfacing a simulated "new" insight) instead of the default toast.
  onSynced?: () => void;
}) {
  const queryClient = useQueryClient();
  const showToast = useUiStore((s) => s.showToast);
  const { syncing, triggerSync } = useSyncStore();
  const isFetching = useIsFetching({ queryKey }) > 0;
  const busy = syncing || isFetching;

  async function handleSync() {
    await triggerSync();
    await queryClient.invalidateQueries({ queryKey });
    if (onSynced) {
      onSynced();
    } else {
      showToast("Data berhasil disinkronkan dari semua platform");
    }
  }

  return (
    <Button disabled={busy} onClick={handleSync}>
      <RefreshCw className={`size-4 ${busy ? "animate-spin" : ""}`} />
      {busy ? "Syncing…" : label}
    </Button>
  );
}
