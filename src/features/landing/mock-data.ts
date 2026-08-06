import { LayoutDashboard, Sparkles, Share2, RefreshCw } from "lucide-react";
import type {
  LandingFeature,
  HowItWorksStep,
  PricingRow,
  HeroPlatformKey,
  HeroPlatformData,
  TrendMetricKey,
  TrendMetric,
} from "./types";

export const FEATURES: LandingFeature[] = [
  {
    icon: LayoutDashboard,
    title: "Satu Dashboard, Semua Platform",
    desc: "Meta Ads dan TikTok Ads digabung jadi satu tampilan yang jernih, jadi kamu nggak perlu bolak-balik antar ads manager.",
    proof: "2 platform, 1 login",
  },
  {
    icon: Sparkles,
    title: "AI Insight yang Mudah Dipahami",
    desc: "Rekomendasi ditulis dengan bahasa yang gampang dimengerti pemilik bisnis — bukan istilah teknis yang bikin bingung.",
    proof: "Update tiap hari",
  },
  {
    icon: Share2,
    title: "Copy as Report Sekali Klik",
    desc: "Ringkas performa iklan jadi laporan yang rapi dan siap dikirim ke tim atau partner bisnis.",
    proof: "Siap kirim dalam hitungan detik",
  },
  {
    icon: RefreshCw,
    title: "Sync Real-Time",
    desc: "Klik Sync, dan seluruh data dari platform yang terhubung langsung diperbarui — kamu selalu lihat angka paling baru.",
    proof: "~2 menit per sync",
  },
];

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    title: "Hubungkan akun iklanmu",
    desc: "Sambungin Meta Ads dan TikTok Ads langsung dari halaman Connect Platform, tanpa ribet bolak-balik developer.",
  },
  {
    title: "Lensa satukan datanya",
    desc: "Semua metrik ditarik otomatis dan digabung real-time, jadi nggak ada lagi rekap manual tiap pagi.",
  },
  {
    title: "Dapat rekomendasi yang jelas",
    desc: "AI Insight ngasih tau apa yang berubah dan langkah selanjutnya — bukan cuma angka mentah yang bikin bingung.",
  },
];

export const PRICING_ROWS: PricingRow[] = [
  { label: "Jumlah bisnis", free: "1 bisnis", pro: "Unlimited" },
  { label: "Platform terhubung", free: "1 platform (Meta atau TikTok)", pro: "Meta + TikTok otomatis" },
  { label: "AI Insight", free: "Dasar (kategori Positif)", pro: "Penuh + export laporan" },
];

export const HERO_PLATFORM_DATA: Record<HeroPlatformKey, HeroPlatformData> = {
  meta: {
    spendValue: 2.4,
    spendDelta: "▲ 8% vs minggu lalu",
    spendUp: true,
    roasValue: 2.9,
    roasDelta: "▲ 5% vs minggu lalu",
    roasUp: true,
    bars: [55, 62, 58, 70, 66, 82, 90],
    insight: "Spend naik 8%, closing ikut naik 12% — performa masih sehat.",
  },
  tiktok: {
    spendValue: 1.6,
    spendDelta: "▲ 32% vs minggu lalu",
    spendUp: true,
    roasValue: 2.3,
    roasDelta: "▼ 3% vs minggu lalu",
    roasUp: false,
    bars: [40, 44, 40, 46, 42, 41, 43],
    insight: "Spend naik 32%, closing masih stagnan — worth dicek targeting.",
  },
};

function weeklyPoints(values: number[]) {
  return values.map((value, i) => ({ week: i + 1, value }));
}

export const TREND_METRICS: Record<TrendMetricKey, TrendMetric> = {
  roas: {
    tabLabel: "ROAS",
    label: "ROAS rata-rata mingguan",
    legend: "ROAS mingguan (kelipatan)",
    goodDirection: "up",
    data: weeklyPoints([2.1, 2.18, 2.25, 2.3, 2.38, 2.45, 2.52, 2.58, 2.65, 2.72, 2.8, 2.9]),
    format: (v) => v.toFixed(1).replace(".", ",") + "x",
  },
  cpa: {
    tabLabel: "CPA",
    label: "CPA rata-rata mingguan",
    legend: "CPA mingguan (Rp ribu)",
    goodDirection: "down",
    data: weeklyPoints([82, 79, 76, 74, 71, 69, 66, 64, 62, 60, 58, 56]),
    format: (v) => "Rp" + Math.round(v * 1000).toLocaleString("id-ID"),
  },
  ctr: {
    tabLabel: "CTR",
    label: "CTR rata-rata mingguan",
    legend: "CTR mingguan (%)",
    goodDirection: "up",
    data: weeklyPoints([2.6, 2.7, 2.8, 2.85, 2.95, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6]),
    format: (v) => v.toFixed(1) + "%",
  },
  closing: {
    tabLabel: "Closing",
    label: "Closing rata-rata mingguan",
    legend: "Closing mingguan (jumlah)",
    goodDirection: "up",
    data: weeklyPoints([24, 25, 27, 28, 30, 31, 33, 34, 36, 37, 39, 40]),
    format: (v) => Math.round(v) + " closing",
  },
};
