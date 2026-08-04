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

export interface OverviewData {
  PLATFORMS: Record<PlatformKey, PlatformData>;
  KPI_ROW_1: { label: string; value: string; cls: "up" | "down" | ""; sub: string }[];
  KPI_ROW_2: { label: string; value: string; cls: "up" | "down" | ""; sub: string }[];
  CHANNEL_CHART_DATA: { spend: { name: string; value: number }[]; closing: { name: string; value: number }[] };
  ACTUALS: { roas: number; closing: number };
}

// Derives every Overview/Detail-Platform-facing number from the raw
// current+previous metrics fetched per business — nothing here is a
// module-level constant anymore (see git history before this refactor for
// the old hardcoded PLATFORM_RAW/PLATFORMS/KPI_ROW_1/etc.).
export function derivePlatformsData(
  raw: Record<PlatformKey, { current: PlatformRaw; previous: PlatformRaw }>
): OverviewData {
  const PLATFORMS: Record<PlatformKey, PlatformData> = {
    meta: { ...PLATFORM_LABELS.meta, metrics: buildMetrics(raw.meta.current, raw.meta.previous) },
    tiktok: { ...PLATFORM_LABELS.tiktok, metrics: buildMetrics(raw.tiktok.current, raw.tiktok.previous) },
  };

  const combinedCurrent = combineRaw(raw.meta.current, raw.tiktok.current);
  const combinedPrevious = combineRaw(raw.meta.previous, raw.tiktok.previous);
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
      { name: "Meta", value: raw.meta.current.spend * 1000 },
      { name: "TikTok", value: raw.tiktok.current.spend * 1000 },
    ],
    closing: [
      { name: "Meta", value: raw.meta.current.closing },
      { name: "TikTok", value: raw.tiktok.current.closing },
    ],
  };

  return {
    PLATFORMS,
    KPI_ROW_1,
    KPI_ROW_2,
    CHANNEL_CHART_DATA,
    ACTUALS: { roas: combinedCurrent.roas, closing: combinedCurrent.closing },
  };
}

export const TARGETS = { roas: 3.5, closing: 90 };

export const CONNECTED_PLATFORM_COUNT = 2;
export const TOTAL_PLATFORM_CATALOG = 2; // becomes 4 once GA/Marketplace Ads are added in a later plan

export type CampaignStatus = "active" | "paused" | "pending" | "archived";

export interface Campaign {
  name: string;
  status: CampaignStatus;
  channel: "Meta Ads" | "TikTok Ads";
  spend: number;
  ctr: string;
  conv: number;
  edited: string;
}

export const CAMPAIGNS: Campaign[] = [
  { name: "Summer Sale 2025", status: "active", channel: "Meta Ads", spend: 4250, ctr: "3.6%", conv: 123, edited: "09/12/2025" },
  { name: "Autumn Collection", status: "paused", channel: "Meta Ads", spend: 3420, ctr: "4.2%", conv: 87, edited: "08/12/2025" },
  { name: "Back-to-School Promo", status: "active", channel: "TikTok Ads", spend: 1980, ctr: "2.9%", conv: 121, edited: "09/12/2025" },
  { name: "Holiday Teaser Ads", status: "archived", channel: "TikTok Ads", spend: 1300, ctr: "1.7%", conv: 44, edited: "07/12/2025" },
  { name: "Retargeting Cart Abandon", status: "pending", channel: "Meta Ads", spend: 860, ctr: "4.2%", conv: 44, edited: "08/12/2025" },
  { name: "Product Launch Beta", status: "active", channel: "TikTok Ads", spend: 1760, ctr: "5.1%", conv: 87, edited: "07/12/2025" },
];

export const STATUS_LABEL: Record<CampaignStatus, string> = {
  active: "Active",
  paused: "Paused",
  pending: "Pending Approval",
  archived: "Archived",
};

export function formatRupiah(nRibu: number): string {
  return "Rp" + (nRibu * 1000).toLocaleString("id-ID");
}

export interface Creative {
  name: string;
  ctr: string;
  status: "Winning" | "Fatigue" | "Baru";
}

export const CREATIVES: Record<string, Creative[]> = {
  "Summer Sale 2025": [
    { name: "Video Diskon 50% — 15 detik", ctr: "4.8%", status: "Winning" },
    { name: "Carousel Koleksi Musim Panas", ctr: "3.4%", status: "Winning" },
    { name: "Statis Harga Coret", ctr: "2.1%", status: "Fatigue" },
  ],
  "Autumn Collection": [
    { name: "Lookbook Autumn — Reels", ctr: "4.6%", status: "Winning" },
    { name: "Foto Produk Outdoor", ctr: "1.9%", status: "Fatigue" },
  ],
  "Back-to-School Promo": [
    { name: "UGC Testimoni Pelajar", ctr: "5.2%", status: "Winning" },
    { name: "Bundle Seragam — Statis", ctr: "2.4%", status: "Baru" },
    { name: "Video Unboxing 20 detik", ctr: "3.0%", status: "Baru" },
  ],
  "Product Launch Beta": [
    { name: "Teaser Produk Baru — 10 detik", ctr: "5.6%", status: "Winning" },
    { name: "Behind the Scene Produksi", ctr: "4.1%", status: "Baru" },
    { name: "Slideshow Fitur Produk", ctr: "2.2%", status: "Fatigue" },
  ],
};

export const PAGE_SIZE = 5;

export const TREND_DATA: Record<7 | 30, { day: string; current: number; previous: number }[]> = {
  7: [
    { day: "1", current: 460, previous: 420 },
    { day: "2", current: 490, previous: 430 },
    { day: "3", current: 530, previous: 400 },
    { day: "4", current: 520, previous: 440 },
    { day: "5", current: 560, previous: 450 },
    { day: "6", current: 600, previous: 460 },
    { day: "7", current: 640, previous: 480 },
  ],
  30: [
    { day: "1", current: 1.9, previous: 1.5 },
    { day: "5", current: 2.1, previous: 1.6 },
    { day: "10", current: 2.2, previous: 1.7 },
    { day: "15", current: 2.5, previous: 1.9 },
    { day: "20", current: 2.8, previous: 2.1 },
    { day: "25", current: 3.3, previous: 2.2 },
    { day: "30", current: 3.8, previous: 2.4 },
  ],
};
