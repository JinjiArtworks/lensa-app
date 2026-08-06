"use client";

import { useQuery } from "@tanstack/react-query";
import { derivePlatformsData, type OverviewData, type PlatformMetricsResponse } from "../mock-data";

async function fetchPlatformMetrics(businessId: string, range: string): Promise<PlatformMetricsResponse> {
  const res = await fetch(
    `/api/platform-metrics?businessId=${encodeURIComponent(businessId)}&range=${encodeURIComponent(range)}`
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Gagal mengambil data platform.");
  }
  return res.json();
}

// Every Overview/Detail-Platform-facing number, scoped to the active
// business AND the active date-range filter — same pair always returns the
// same numbers, switching either one visibly changes the dashboard.
export function useOverviewData(businessId: string | undefined, range: string = "year") {
  return useQuery<OverviewData>({
    queryKey: ["platform-metrics", businessId, range],
    queryFn: async () => derivePlatformsData(await fetchPlatformMetrics(businessId as string, range)),
    enabled: Boolean(businessId),
  });
}
