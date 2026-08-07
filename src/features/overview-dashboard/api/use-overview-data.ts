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
// `connectedPlatforms` isn't part of the query key — the raw fetch doesn't
// depend on it, only the derived shape does, so it's applied via `select`.
// Connecting a platform on the Binding page re-derives instantly once
// `useConnectedPlatforms` refetches, no extra network round-trip needed.
export function useOverviewData(
  businessId: string | undefined,
  range: string = "year",
  connectedPlatforms: string[] = []
) {
  return useQuery<PlatformMetricsResponse, Error, OverviewData>({
    queryKey: ["platform-metrics", businessId, range],
    queryFn: () => fetchPlatformMetrics(businessId as string, range),
    select: (raw) => derivePlatformsData(raw, connectedPlatforms),
    enabled: Boolean(businessId),
  });
}
