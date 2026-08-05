"use client";

import { useQuery } from "@tanstack/react-query";
import { derivePlatformsData, type OverviewData, type PlatformMetricsResponse } from "../mock-data";

async function fetchPlatformMetrics(businessId: string): Promise<PlatformMetricsResponse> {
  const res = await fetch(`/api/platform-metrics?businessId=${encodeURIComponent(businessId)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Gagal mengambil data platform.");
  }
  return res.json();
}

// Every Overview/Detail-Platform-facing number, scoped to the active
// business (per standards/09-data-layer-wiring.md §B poin 5) instead of one
// static dataset shared by every business.
export function useOverviewData(businessId: string | undefined) {
  return useQuery<OverviewData>({
    queryKey: ["platform-metrics", businessId],
    queryFn: async () => derivePlatformsData(await fetchPlatformMetrics(businessId as string)),
    enabled: Boolean(businessId),
  });
}
