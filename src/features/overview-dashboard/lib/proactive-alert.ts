import type { PlatformData } from "../mock-data";

const SPEND_SPIKE_PCT = 20;
const CLOSING_STAGNANT_PCT = 5;

function parsePct(sub: string): number {
  const match = sub.match(/(\d+(?:\.\d+)?)%/);
  return match ? parseFloat(match[1]) : 0;
}

export function shouldShowProactiveAlert(
  platforms: Record<string, PlatformData>
): { show: boolean; platformName?: string; spendPct?: number } {
  for (const key of Object.keys(platforms)) {
    const p = platforms[key];
    const spendUp = p.metrics.Spend.sub.includes("▲") && parsePct(p.metrics.Spend.sub) >= SPEND_SPIKE_PCT;
    const closingStagnant = parsePct(p.metrics.Closing.sub) < CLOSING_STAGNANT_PCT;
    if (spendUp && closingStagnant) {
      return { show: true, platformName: p.name, spendPct: Math.round(parsePct(p.metrics.Spend.sub)) };
    }
  }
  return { show: false };
}
