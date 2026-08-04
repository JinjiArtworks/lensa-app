export interface PlatformRaw {
  spend: number; // juta rupiah
  closing: number;
  roas: number;
  ctr: number; // percent
  impresi: number; // ribu
  klik: number;
  campaignAktif: number;
}

// CPA is never an independent input — it's always spend divided by closing,
// for a single platform or for the combined total alike.
export function cpaFromRaw(raw: PlatformRaw): number {
  return (raw.spend * 1_000_000) / raw.closing;
}

// Combining two platforms' metrics isn't averaging: ROAS must be
// spend-weighted (a platform that spent more should move the combined
// number more), and CTR/CPA must be recomputed from the summed totals
// (klik/impresi, spend/closing) rather than averaged from each platform's
// own already-derived rate.
export function combineRaw(a: PlatformRaw, b: PlatformRaw): PlatformRaw {
  const spend = a.spend + b.spend;
  const closing = a.closing + b.closing;
  const impresi = a.impresi + b.impresi;
  const klik = a.klik + b.klik;
  const campaignAktif = a.campaignAktif + b.campaignAktif;
  const roas = (a.spend * a.roas + b.spend * b.roas) / spend;
  const ctr = (klik / (impresi * 1000)) * 100;
  return { spend, closing, roas, ctr, impresi, klik, campaignAktif };
}

// Replaces hand-authored delta copy ("▲ 8% vs periode lalu") with a real
// current-vs-previous computation, now that both are seeded per business
// instead of one platform having a single hardcoded "current" value.
export function computeDelta(
  current: number,
  previous: number,
  higherIsBetter = true
): { cls: "up" | "down" | ""; sub: string } {
  if (previous === 0) return { cls: "", sub: "Tidak ada perubahan" };
  const pct = ((current - previous) / previous) * 100;
  if (Math.abs(pct) < 0.5) return { cls: "", sub: "Tidak ada perubahan" };
  const rose = pct > 0;
  const cls: "up" | "down" = rose === higherIsBetter ? "up" : "down";
  const arrow = rose ? "▲" : "▼";
  return { cls, sub: `${arrow} ${Math.abs(pct).toFixed(1)}% vs periode lalu` };
}

export function formatJuta(v: number): string {
  return "Rp" + v.toFixed(1).replace(".", ",") + "jt";
}
export function formatRibuRupiah(rupiah: number): string {
  return "Rp" + Math.round(rupiah / 1000) + "rb";
}
export function formatRibu(v: number): string {
  return Math.round(v) + "rb";
}
export function formatCount(v: number): string {
  return Math.round(v).toLocaleString("id-ID");
}
export function formatRoas(v: number): string {
  return v.toFixed(1) + "x";
}
export function formatPercent(v: number): string {
  return v.toFixed(1) + "%";
}
