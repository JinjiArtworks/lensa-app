import type { OverviewData } from "@/features/overview-dashboard/mock-data";
import { shouldShowProactiveAlert } from "@/features/overview-dashboard/lib/proactive-alert";
import { INSIGHT_DATA, SYNC_INSIGHT_POOL } from "../mock-data";
import type { BenchmarkMetric, InsightItem, PeriodKey } from "../types";

// Kartu anomali "live" di periode Minggu Ini dituntun dari PLATFORMS milik bisnis aktif
// (di-fetch via useOverviewData, sama sumbernya dengan Proactive Alert Card di
// Overview — lihat proactive-alert.ts) — satu sumber logic dipakai di 2 tempat,
// bukan duplikasi angka/threshold. `platforms` di-pass dari pemanggil (bukan import
// statis) karena sekarang di-scope per businessId.
const LIVE_ANOMALY_ID = "week-anomali-1";

function buildLiveAnomalyItem(platforms: OverviewData["PLATFORMS"]): InsightItem | null {
  const alert = shouldShowProactiveAlert(platforms);
  if (!alert.show || !alert.platformName || alert.spendPct === undefined) return null;
  const platformKey = /tiktok/i.test(alert.platformName) ? "tiktok" : "meta";
  return {
    id: LIVE_ANOMALY_ID,
    category: "anomali",
    platformLabel: alert.platformName,
    platformKey,
    title: "Spend naik, closing stagnan",
    body: `Spend ${alert.platformName} naik ${alert.spendPct}% dari kemarin tapi closing hampir tidak bergerak. Kemungkinan targeting terlalu luas atau creative mulai jenuh.`,
    time: "2 jam lalu",
    actionLabel: "Tandai sudah ditinjau",
    impact: "Tinggi",
    impactNote: `Coba persempit targeting atau ganti creative dalam 1-2 hari — berpotensi menghindari spend terbuang tanpa closing tambahan (spend naik ${alert.spendPct}%).`,
  };
}

export function getInsightsForPeriod(period: PeriodKey, platforms: OverviewData["PLATFORMS"] | undefined): InsightItem[] {
  const { items } = INSIGHT_DATA[period];
  if (period !== "week" || !platforms) return items;

  const live = buildLiveAnomalyItem(platforms);
  if (!live) return items;
  return items.map((item) => (item.id === LIVE_ANOMALY_ID ? live : item));
}

export function getCompareLine(period: PeriodKey): string {
  return INSIGHT_DATA[period].compareLine;
}

// "Sync & Analisis Ulang" simulation — picks one scenario from SYNC_INSIGHT_POOL
// the caller hasn't already surfaced this session (excludeIds accumulates across
// clicks so numbers keep climbing instead of just swapping the same +1 item).
// Returns null once the whole pool's been surfaced — still a simulated/template
// pick, not a live re-analysis, so it can't invent scenarios forever.
export function pickFreshInsight(excludeIds: string[]): InsightItem | null {
  const candidates = SYNC_INSIGHT_POOL.filter((it) => !excludeIds.includes(it.id));
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function computeInsightStats(items: InsightItem[]): {
  total: number;
  urgent: number;
  newRecommendations: number;
} {
  return {
    total: items.length,
    urgent: items.filter((it) => it.impact === "Tinggi").length,
    newRecommendations: items.filter((it) => it.category === "rekomendasi").length,
  };
}

// Prioritas: ambil insight impact Tinggi dulu; kalau kurang dari 2, tambahkan
// impact Sedang sampai maksimal 3 kandidat total — biar panel "Rekomendasi
// Prioritas" tidak pernah kosong padahal ada insight yang cukup penting.
export function pickPriorityInsights(items: InsightItem[]): InsightItem[] {
  const tinggi = items.filter((it) => it.impact === "Tinggi");
  const candidates = [...tinggi];
  if (candidates.length < 2) {
    for (const it of items) {
      if (it.impact === "Sedang" && !candidates.includes(it)) candidates.push(it);
    }
  }
  return candidates.slice(0, 3);
}

export function computeBenchmarkDelta(metric: BenchmarkMetric): {
  better: boolean;
  pct: number;
  youBarPct: number;
  indBarPct: number;
} {
  const max = Math.max(metric.you, metric.ind) || 1;
  const diff = metric.higherBetter
    ? (metric.you - metric.ind) / metric.ind
    : (metric.ind - metric.you) / metric.ind;
  return {
    better: diff >= 0,
    pct: Math.abs(Math.round(diff * 100)),
    youBarPct: Math.round((metric.you / max) * 100),
    indBarPct: Math.round((metric.ind / max) * 100),
  };
}

export function filterInsights(
  items: InsightItem[],
  category: "all" | InsightItem["category"],
  platform: "all" | "meta" | "tiktok"
): InsightItem[] {
  return items.filter((it) => {
    const categoryOk = category === "all" || it.category === category;
    const platformOk = platform === "all" || it.platformKey === platform;
    return categoryOk && platformOk;
  });
}
