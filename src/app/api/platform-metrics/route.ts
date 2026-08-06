import { NextRequest, NextResponse } from "next/server";
import {
  seededPlatformRaw,
  seededTrendSeries,
  seededPlatformTrendSeries,
} from "@/features/overview-dashboard/lib/seed";
import type { PlatformRaw } from "@/features/overview-dashboard/lib/kpi";
import type { PlatformMetricsResponse } from "@/features/overview-dashboard/mock-data";

// Hand-tuned baseline every business's numbers vary around — not itself
// served to the client, only the seeded variance of it is.
const BASE_PLATFORM_RAW: Record<"meta" | "tiktok", PlatformRaw> = {
  meta: { spend: 2.4, closing: 40, roas: 2.9, ctr: 3.6, impresi: 128, klik: 4600, campaignAktif: 7 },
  tiktok: { spend: 1.4, closing: 22, roas: 2.3, ctr: 2.8, impresi: 96, klik: 2900, campaignAktif: 5 },
};

const BASE_TREND_DATA: Record<7 | 30, { day: string; current: number; previous: number }[]> = {
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

const BASE_PLATFORM_TREND: Record<"meta" | "tiktok", { day: string; spend: number; closing: number }[]> = {
  meta: [
    { day: "1", spend: 340, closing: 5 },
    { day: "2", spend: 360, closing: 5 },
    { day: "3", spend: 355, closing: 6 },
    { day: "4", spend: 380, closing: 6 },
    { day: "5", spend: 395, closing: 7 },
    { day: "6", spend: 410, closing: 7 },
    { day: "7", spend: 430, closing: 8 },
  ],
  tiktok: [
    { day: "1", spend: 210, closing: 3 },
    { day: "2", spend: 230, closing: 3 },
    { day: "3", spend: 260, closing: 4 },
    { day: "4", spend: 290, closing: 3 },
    { day: "5", spend: 330, closing: 3 },
    { day: "6", spend: 360, closing: 4 },
    { day: "7", spend: 400, closing: 4 },
  ],
};

const SIMULATED_DELAY_MS = [300, 800] as const;
// Deliberately disabled by default so the demo has a reliable happy path;
// flip to test loading/error/retry UI without code changes.
const ERROR_RATE = 0;

function randomDelay(): Promise<void> {
  const ms = SIMULATED_DELAY_MS[0] + Math.random() * (SIMULATED_DELAY_MS[1] - SIMULATED_DELAY_MS[0]);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: NextRequest) {
  const businessId = request.nextUrl.searchParams.get("businessId");
  const range = request.nextUrl.searchParams.get("range") ?? "year";
  if (!businessId) {
    return NextResponse.json({ error: "businessId query param is required" }, { status: 400 });
  }

  await randomDelay();

  if (Math.random() < ERROR_RATE) {
    return NextResponse.json({ error: "Gagal mengambil data platform. Coba lagi." }, { status: 503 });
  }

  const seed = `${businessId}:${range}`;

  const body: PlatformMetricsResponse = {
    meta: {
      current: seededPlatformRaw(`${seed}:meta:current`, BASE_PLATFORM_RAW.meta),
      previous: seededPlatformRaw(`${seed}:meta:previous`, BASE_PLATFORM_RAW.meta),
    },
    tiktok: {
      current: seededPlatformRaw(`${seed}:tiktok:current`, BASE_PLATFORM_RAW.tiktok),
      previous: seededPlatformRaw(`${seed}:tiktok:previous`, BASE_PLATFORM_RAW.tiktok),
    },
    trend: {
      7: seededTrendSeries(`${seed}:trend:7`, BASE_TREND_DATA[7]),
      30: seededTrendSeries(`${seed}:trend:30`, BASE_TREND_DATA[30]),
    },
    platformTrend: {
      meta: seededPlatformTrendSeries(`${seed}:platform-trend:meta`, BASE_PLATFORM_TREND.meta),
      tiktok: seededPlatformTrendSeries(`${seed}:platform-trend:tiktok`, BASE_PLATFORM_TREND.tiktok),
    },
  };

  return NextResponse.json(body);
}
