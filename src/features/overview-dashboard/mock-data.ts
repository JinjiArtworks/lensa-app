import {
  computeDelta,
  cpaFromRaw,
  combineRaw,
  formatCount,
  formatJuta,
  formatPercent,
  formatRibu,
  formatRibuRupiah,
  formatRoas,
  type PlatformRaw,
} from "./lib/kpi";

export type PlatformKey = "meta" | "tiktok";

export interface MetricEntry {
  value: string;
  cls: "up" | "down" | "";
  sub: string;
}

export interface PlatformData {
  name: string;
  ic: string;
  metrics: Record<string, MetricEntry>;
}

// Static name/icon, independent of businessId — components that only need
// display labels (not real metrics) can import this directly instead of
// going through useOverviewData().
export const PLATFORM_LABELS: Record<PlatformKey, { name: string; ic: string }> = {
  meta: { name: "Meta Ads", ic: "M" },
  tiktok: { name: "TikTok Ads", ic: "TT" },
};

// Shared categorical color per platform — used by every chart that breaks a
// metric down by platform (Detail Platform trend chart, Overview donut chart).
export const PLATFORM_CHART_COLOR: Record<PlatformKey, string> = {
  meta: "#f0b400",
  tiktok: "#4f8cff",
};

// Single source of truth for every number shown for a platform, on both the
// Overview (combined) and Detail Platform (per-platform) pages — every value
// (including the delta "sub"/"cls") is computed from current-vs-previous raw
// numbers via computeDelta(), never typed independently. `current`/`previous`
// come from the /api/platform-metrics Route Handler (seeded per businessId),
// not a hardcoded module-level constant — see
// features/overview-dashboard/api/use-overview-data.ts.
function buildMetrics(current: PlatformRaw, previous: PlatformRaw): Record<string, MetricEntry> {
  const cpaCurrent = cpaFromRaw(current);
  const cpaPrevious = cpaFromRaw(previous);
  return {
    Spend: { value: formatJuta(current.spend), ...computeDelta(current.spend, previous.spend) },
    Closing: { value: formatCount(current.closing), ...computeDelta(current.closing, previous.closing) },
    ROAS: { value: formatRoas(current.roas), ...computeDelta(current.roas, previous.roas) },
    // Lower CPA is better, so a rise should read as "down" (bad), not "up".
    CPA: { value: formatRibuRupiah(cpaCurrent), ...computeDelta(cpaCurrent, cpaPrevious, false) },
    CTR: { value: formatPercent(current.ctr), ...computeDelta(current.ctr, previous.ctr) },
    Impresi: { value: formatRibu(current.impresi), ...computeDelta(current.impresi, previous.impresi) },
    Klik: { value: formatCount(current.klik), ...computeDelta(current.klik, previous.klik) },
    "Campaign Aktif": {
      value: formatCount(current.campaignAktif),
      ...computeDelta(current.campaignAktif, previous.campaignAktif),
    },
  };
}

// The full shape returned by GET /api/platform-metrics — trend/platformTrend
// are seeded per businessId server-side (see the Route Handler), same as
// meta/tiktok.
export interface PlatformMetricsResponse {
  meta: { current: PlatformRaw; previous: PlatformRaw };
  tiktok: { current: PlatformRaw; previous: PlatformRaw };
  trend: Record<7 | 30, { day: string; current: number; previous: number }[]>;
  platformTrend: Record<PlatformKey, { day: string; spend: number; closing: number }[]>;
}

export interface OverviewData {
  PLATFORMS: Record<PlatformKey, PlatformData>;
  KPI_ROW_1: { label: string; value: string; cls: "up" | "down" | ""; sub: string }[];
  KPI_ROW_2: { label: string; value: string; cls: "up" | "down" | ""; sub: string }[];
  CHANNEL_CHART_DATA: { spend: { name: string; value: number }[]; closing: { name: string; value: number }[] };
  EFFICIENCY_CHART_DATA: { ctr: { name: string; value: number }[]; cpa: { name: string; value: number }[] };
  ACTUALS: { roas: number; closing: number };
  TREND_DATA: Record<7 | 30, { day: string; current: number; previous: number }[]>;
  PLATFORM_TREND: Record<PlatformKey, { day: string; spend: number; closing: number }[]>;
  // Raw current/previous per platform — Detail Platform's own charts (period
  // compare, click-share donut) need actual numbers, not the pre-formatted
  // `metrics` strings meant for display.
  PLATFORM_RAW: Record<PlatformKey, { current: PlatformRaw; previous: PlatformRaw }>;
}

// A platform the business hasn't bound yet contributes nothing — no real
// spend/closing/etc. exists for it, so every field reads 0 rather than the
// seeded mock number `/api/platform-metrics` still generates for it under
// the hood (that generator has no concept of binding, see the route handler).
const ZERO_RAW: PlatformRaw = { spend: 0, closing: 0, roas: 0, ctr: 0, impresi: 0, klik: 0, campaignAktif: 0 };

// Derives every Overview/Detail-Platform-facing number from the raw
// current+previous metrics fetched per business — nothing here is a
// module-level constant anymore (see git history before this refactor for
// the old hardcoded PLATFORM_RAW/PLATFORMS/KPI_ROW_1/etc.). `connectedPlatforms`
// zeroes out any platform not yet bound, so newly-created businesses (nothing
// bound) show an honest 0 instead of the seeded mock number.
export function derivePlatformsData(raw: PlatformMetricsResponse, connectedPlatforms: string[]): OverviewData {
  const effective = (key: PlatformKey, side: "current" | "previous"): PlatformRaw =>
    connectedPlatforms.includes(key) ? raw[key][side] : ZERO_RAW;
  const metaCurrent = effective("meta", "current");
  const metaPrevious = effective("meta", "previous");
  const tiktokCurrent = effective("tiktok", "current");
  const tiktokPrevious = effective("tiktok", "previous");

  const PLATFORMS: Record<PlatformKey, PlatformData> = {
    meta: { ...PLATFORM_LABELS.meta, metrics: buildMetrics(metaCurrent, metaPrevious) },
    tiktok: { ...PLATFORM_LABELS.tiktok, metrics: buildMetrics(tiktokCurrent, tiktokPrevious) },
  };

  const combinedCurrent = combineRaw(metaCurrent, tiktokCurrent);
  const combinedPrevious = combineRaw(metaPrevious, tiktokPrevious);
  const cpaCurrent = cpaFromRaw(combinedCurrent);
  const cpaPrevious = cpaFromRaw(combinedPrevious);

  const KPI_ROW_1 = [
    {
      label: "Total Spend",
      value: formatJuta(combinedCurrent.spend),
      ...computeDelta(combinedCurrent.spend, combinedPrevious.spend),
    },
    {
      label: "Total Closing",
      value: formatCount(combinedCurrent.closing),
      ...computeDelta(combinedCurrent.closing, combinedPrevious.closing),
    },
    {
      label: "ROAS",
      value: formatRoas(combinedCurrent.roas),
      ...computeDelta(combinedCurrent.roas, combinedPrevious.roas),
    },
    { label: "CPA", value: formatRibuRupiah(cpaCurrent), ...computeDelta(cpaCurrent, cpaPrevious, false) },
  ];

  const KPI_ROW_2 = [
    {
      label: "CTR",
      value: formatPercent(combinedCurrent.ctr),
      ...computeDelta(combinedCurrent.ctr, combinedPrevious.ctr),
    },
    {
      label: "Impresi",
      value: formatRibu(combinedCurrent.impresi),
      ...computeDelta(combinedCurrent.impresi, combinedPrevious.impresi),
    },
    {
      label: "Klik",
      value: formatCount(combinedCurrent.klik),
      ...computeDelta(combinedCurrent.klik, combinedPrevious.klik),
    },
    {
      label: "Campaign Aktif",
      value: formatCount(combinedCurrent.campaignAktif),
      ...computeDelta(combinedCurrent.campaignAktif, combinedPrevious.campaignAktif),
    },
  ];

  const CHANNEL_CHART_DATA = {
    spend: [
      { name: "Meta", value: metaCurrent.spend * 1000 },
      { name: "TikTok", value: tiktokCurrent.spend * 1000 },
    ],
    closing: [
      { name: "Meta", value: metaCurrent.closing },
      { name: "TikTok", value: tiktokCurrent.closing },
    ],
  };

  const EFFICIENCY_CHART_DATA = {
    ctr: [
      { name: "Meta", value: metaCurrent.ctr },
      { name: "TikTok", value: tiktokCurrent.ctr },
    ],
    cpa: [
      { name: "Meta", value: cpaFromRaw(metaCurrent) },
      { name: "TikTok", value: cpaFromRaw(tiktokCurrent) },
    ],
  };

  // The overall trend series (unlike PLATFORM_RAW) isn't derived per-platform
  // — it's its own seeded series — so it can't be partially zeroed per
  // platform. With nothing bound at all there's nothing to trend, though.
  const TREND_DATA =
    connectedPlatforms.length === 0
      ? {
          7: raw.trend[7].map((d) => ({ ...d, current: 0, previous: 0 })),
          30: raw.trend[30].map((d) => ({ ...d, current: 0, previous: 0 })),
        }
      : raw.trend;

  return {
    PLATFORMS,
    KPI_ROW_1,
    KPI_ROW_2,
    CHANNEL_CHART_DATA,
    EFFICIENCY_CHART_DATA,
    ACTUALS: { roas: combinedCurrent.roas, closing: combinedCurrent.closing },
    TREND_DATA,
    PLATFORM_TREND: raw.platformTrend,
    PLATFORM_RAW: { meta: raw.meta, tiktok: raw.tiktok },
  };
}

export const TARGETS = { roas: 3.5, closing: 90 };
