import type { LucideIcon } from "lucide-react";

export interface LandingFeature {
  icon: LucideIcon;
  title: string;
  desc: string;
  proof: string;
}

export interface HowItWorksStep {
  title: string;
  desc: string;
}

export interface Testimonial {
  quote: string;
  stat: string;
  name: string;
  business: string;
  avatarInitial: string;
}

export interface PricingRow {
  label: string;
  free: string;
  pro: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export type HeroPlatformKey = "meta" | "tiktok";

export interface HeroPlatformData {
  spendValue: number;
  spendDelta: string;
  spendUp: boolean;
  roasValue: number;
  roasDelta: string;
  roasUp: boolean;
  bars: number[];
  insight: string;
}

export type TrendMetricKey = "roas" | "cpa" | "ctr" | "closing";

export interface TrendPoint {
  week: number;
  value: number;
}

export interface TrendMetric {
  tabLabel: string;
  label: string;
  legend: string;
  goodDirection: "up" | "down";
  data: TrendPoint[];
  format: (value: number) => string;
}
