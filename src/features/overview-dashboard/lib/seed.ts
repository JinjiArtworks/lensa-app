import type { PlatformRaw } from "./kpi";

// Deterministic PRNG (mulberry32) seeded from a string — same businessId always
// produces the same numbers, different businessId produces different numbers.
// Not cryptographic, not meant to be: this only exists so switching the active
// business in the UI visibly changes the mock metrics instead of staying frozen
// to one global dataset.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(31, hash) + input.charCodeAt(i)) | 0;
  }
  return hash;
}

// +/- variancePct around each field of `base`, seeded from `seed` — keeps
// numbers in a plausible range (never negative, never wildly off from the
// hand-tuned baseline) while still varying per business.
export function seededPlatformRaw(seed: string, base: PlatformRaw, variancePct = 0.25): PlatformRaw {
  const rand = mulberry32(hashString(seed));
  const vary = (v: number) => v * (1 - variancePct + rand() * variancePct * 2);
  return {
    spend: vary(base.spend),
    closing: Math.max(1, Math.round(vary(base.closing))),
    roas: vary(base.roas),
    ctr: vary(base.ctr),
    impresi: vary(base.impresi),
    klik: Math.round(vary(base.klik)),
    campaignAktif: Math.max(1, Math.round(vary(base.campaignAktif))),
  };
}

// A single +/- variancePct multiplier seeded from `seed` — the building block
// for varying trend series below, where each series needs its own independent
// scale rather than sharing seededPlatformRaw's per-field PRNG stream.
export function seededVariance(seed: string, variancePct = 0.25): number {
  const rand = mulberry32(hashString(seed));
  return 1 - variancePct + rand() * variancePct * 2;
}

// One scale factor applied uniformly across the whole series (not per-point)
// so the shape/trend of the line stays coherent instead of turning jagged.
export function seededTrendSeries<T extends { current: number; previous: number }>(
  seed: string,
  base: T[],
  variancePct = 0.25
): T[] {
  const scale = seededVariance(seed, variancePct);
  return base.map((point) => ({ ...point, current: point.current * scale, previous: point.previous * scale }));
}

// Same as seededTrendSeries but for the spend/closing shape used by the
// per-platform trend chart.
export function seededPlatformTrendSeries<T extends { spend: number; closing: number }>(
  seed: string,
  base: T[],
  variancePct = 0.25
): T[] {
  const scale = seededVariance(seed, variancePct);
  return base.map((point) => ({
    ...point,
    spend: point.spend * scale,
    closing: Math.max(1, Math.round(point.closing * scale)),
  }));
}
