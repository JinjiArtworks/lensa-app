import { NextRequest, NextResponse } from "next/server";
import { seededPlatformRaw } from "@/features/overview-dashboard/lib/seed";
import type { PlatformRaw } from "@/features/overview-dashboard/lib/kpi";

// Hand-tuned baseline every business's numbers vary around — not itself
// served to the client, only the seeded variance of it is.
const BASE_PLATFORM_RAW: Record<"meta" | "tiktok", PlatformRaw> = {
  meta: { spend: 2.4, closing: 40, roas: 2.9, ctr: 3.6, impresi: 128, klik: 4600, campaignAktif: 7 },
  tiktok: { spend: 1.4, closing: 22, roas: 2.3, ctr: 2.8, impresi: 96, klik: 2900, campaignAktif: 5 },
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
  if (!businessId) {
    return NextResponse.json({ error: "businessId query param is required" }, { status: 400 });
  }

  await randomDelay();

  if (Math.random() < ERROR_RATE) {
    return NextResponse.json({ error: "Gagal mengambil data platform. Coba lagi." }, { status: 503 });
  }

  const body: Record<"meta" | "tiktok", { current: PlatformRaw; previous: PlatformRaw }> = {
    meta: {
      current: seededPlatformRaw(`${businessId}:meta:current`, BASE_PLATFORM_RAW.meta),
      previous: seededPlatformRaw(`${businessId}:meta:previous`, BASE_PLATFORM_RAW.meta),
    },
    tiktok: {
      current: seededPlatformRaw(`${businessId}:tiktok:current`, BASE_PLATFORM_RAW.tiktok),
      previous: seededPlatformRaw(`${businessId}:tiktok:previous`, BASE_PLATFORM_RAW.tiktok),
    },
  };

  return NextResponse.json(body);
}
