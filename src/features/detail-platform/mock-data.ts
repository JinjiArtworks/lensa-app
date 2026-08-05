// Baseline trend series moved to src/app/api/platform-metrics/route.ts
// (BASE_PLATFORM_TREND) — seeded per businessId, see
// features/overview-dashboard/lib/seed.ts's seededPlatformTrendSeries.

export const PLATFORM_CHART_COLOR: Record<"meta" | "tiktok", string> = {
  meta: "#f0b400",
  tiktok: "#4f8cff",
};
