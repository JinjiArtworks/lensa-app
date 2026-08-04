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
