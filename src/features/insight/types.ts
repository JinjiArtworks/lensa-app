export type InsightCategory = "anomali" | "rekomendasi" | "positif";
export type ImpactLevel = "Tinggi" | "Sedang" | "Rendah";
export type PlatformKey = "meta" | "tiktok" | "semua";
// Mirrors FilterBar's FilterPreset — AI Insight uses the same global date-range
// filter as Overview/Detail Platform instead of its own bespoke period set.
export type PeriodKey = "week" | "month" | "year" | "custom";

export interface InsightItem {
  id: string;
  category: InsightCategory;
  platformLabel: string;
  platformKey: PlatformKey;
  title: string;
  body: string;
  impact: ImpactLevel;
  impactNote: string;
  time: string;
  actionLabel: string;
  actionHref?: string;
}

export interface PeriodInsightData {
  compareLine: string;
  items: InsightItem[];
}

export interface BenchmarkMetric {
  name: string;
  you: number;
  ind: number;
  youText: string;
  indText: string;
  higherBetter: boolean;
  good: string;
  bad: string;
}

export interface BudgetRecommendation {
  key: "meta" | "tiktok";
  cur: number;
  sug: number;
  why: string;
}
