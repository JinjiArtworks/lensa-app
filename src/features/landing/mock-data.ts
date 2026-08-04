import { LayoutDashboard, Sparkles, Share2, RefreshCw } from "lucide-react";
import type {
  LandingFeature,
  HowItWorksStep,
  Testimonial,
  PricingRow,
  FaqItem,
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
    desc: "Sambungkan Meta Ads dan TikTok Ads dalam kurang dari 2 menit, tanpa perlu bantuan developer.",
  },
  {
    title: "Lensa satukan datanya",
    desc: "Setiap metrik ditarik otomatis dan digabung secara real-time, jadi kamu nggak perlu rekap manual lagi.",
  },
  {
    title: "Dapat rekomendasi yang jelas",
    desc: "AI Insight merangkum apa yang berubah dan apa yang sebaiknya kamu lakukan — bukan cuma angka mentah.",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Dulu tiap pagi saya buka dua ads manager plus spreadsheet cuma buat tau performa kemarin gimana. Sekarang lima menit di Lensa, saya udah tau mana yang harus segera saya benerin.",
    stat: "+18% closing dalam 2 minggu pertama",
    name: "Sinta",
    business: "Toko Baju Sinta · Fashion",
    avatarInitial: "S",
  },
  {
    quote:
      "AI Insight-nya kerasa kayak dikasih saran sama orang yang ngerti bisnis saya — bukan cuma angka. Realokasi budget yang disaranin beneran naikin closing kita bulan itu juga.",
    stat: "+22% ROAS di bulan pertama",
    name: "Pak Budi",
    business: "Dapur Bu Retno · F&B",
    avatarInitial: "B",
  },
  {
    quote:
      "Tim saya cuma berdua, gantian pegang iklan. Copy as Report bikin serah terima ke partner jadi rapi tanpa perlu meeting panjang tiap minggu.",
    stat: "~3 jam/minggu dihemat dari rekap manual",
    name: "Nadia",
    business: "Glowlab Skincare",
    avatarInitial: "N",
  },
];

export const PRICING_ROWS: PricingRow[] = [
  { label: "Jumlah bisnis", free: "1 bisnis", pro: "Unlimited" },
  { label: "Platform terhubung", free: "1 platform (Meta atau TikTok)", pro: "Meta + TikTok otomatis" },
  { label: "AI Insight", free: "Dasar (kategori Positif)", pro: "Penuh + export laporan" },
  { label: "Anggota tim", free: "1 pengguna", pro: "Undang tim (Admin/Viewer)" },
  { label: "Histori data", free: "7 hari", pro: "Tanpa batas" },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Apakah data toko saya aman?",
    answer:
      "Aman. Lensa hanya membaca data performa lewat akses resmi API Meta dan TikTok — bukan password akun kamu. Akses ini bisa kamu cabut kapan saja lewat pengaturan.",
  },
  {
    question: "Apakah proses connect akun Meta/TikTok Ads ribet?",
    answer:
      'Nggak. Dari halaman Connect Platform, klik "Hubungkan" lalu login lewat halaman resmi Meta/TikTok. Prosesnya sekitar 2 menit, tanpa bantuan developer.',
  },
  {
    question: "Paket Free-nya beneran gratis selamanya?",
    answer:
      "Betul. Free bisa kamu pakai selama yang kamu mau, untuk 1 bisnis dan 1 platform. Nggak ada trial otomatis yang tiba-tiba menagih kartu kamu.",
  },
  {
    question: "Bagaimana kalau saya beriklan di platform selain Meta/TikTok?",
    answer:
      "Saat ini Lensa fokus dulu di Meta Ads dan TikTok Ads, karena ini kombinasi yang paling umum dipakai bisnis kecil-menengah di Indonesia. Platform lain ada di rencana pengembangan berikutnya.",
  },
  {
    question: "Bisa upgrade atau downgrade kapan saja?",
    answer:
      "Bisa. Upgrade ke Pro langsung aktif saat itu juga, sedangkan downgrade ke Free berlaku di periode tagihan berikutnya, tanpa penalti.",
  },
  {
    question: "Apakah saya perlu kartu kredit buat mencoba?",
    answer: "Nggak perlu. Paket Free bisa langsung kamu pakai tanpa kartu kredit sama sekali.",
  },
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
    format: (v) => "Rp" + Math.round(v) + "rb",
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
