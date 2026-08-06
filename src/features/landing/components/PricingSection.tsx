"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";
import { PRICING_ROWS } from "../mock-data";

type BillingCycle = "monthly" | "annual";

const PRO_PRICE: Record<BillingCycle, { price: string; note: string }> = {
  monthly: { price: "Rp149.000", note: "" },
  annual: { price: "Rp119.000", note: "Ditagih Rp1.430.400/tahun" },
};

export function PricingSection({ onOpenCheckout }: { onOpenCheckout: () => void }) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const pro = PRO_PRICE[cycle];

  return (
    <section id="harga" className="scroll-mt-20 py-16 md:py-[92px]">
      <div className="mx-auto max-w-[1100px] px-5">
        <Reveal className="mx-auto mb-7 max-w-[620px] text-center">
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-accent-text">
            Investasi yang Masuk Akal
          </span>
          <h2 className="mt-3.5 font-display text-[26px] font-bold tracking-tight sm:text-[28px] md:text-[36px]">
            Harga yang mudah dipahami, tanpa kejutan di akhir.
          </h2>
          <p className="mt-3.5 text-[15px] leading-relaxed text-ink-2 sm:text-[15.5px]">
            Mulai dari gratis. Upgrade begitu bisnismu sudah butuh lebih dari satu platform.
          </p>
        </Reveal>

        <Reveal
          className="mx-auto mb-8 flex w-fit gap-1 rounded-full bg-gray-bg p-1"
          role="tablist"
          aria-label="Siklus tagihan"
        >
          <button
            type="button"
            role="tab"
            aria-selected={cycle === "monthly"}
            onClick={() => setCycle("monthly")}
            className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
              cycle === "monthly" ? "bg-card text-ink shadow-sm" : "text-ink-2"
            }`}
          >
            Bulanan
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={cycle === "annual"}
            onClick={() => setCycle("annual")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
              cycle === "annual" ? "bg-card text-ink shadow-sm" : "text-ink-2"
            }`}
          >
            Tahunan
            <span className="rounded-full bg-green-bg px-2 py-0.5 text-[9.5px] font-extrabold text-green">
              Hemat 20%
            </span>
          </button>
        </Reveal>

        <div className="mx-auto grid max-w-[720px] grid-cols-1 gap-5 sm:grid-cols-2">
          <Reveal className="rounded-2xl border border-line bg-card p-6">
            <div className="font-display text-base font-bold">Free</div>
            <div className="mt-2 font-display text-[26px] font-bold">
              Rp0<small className="text-xs font-normal text-ink-3">/bulan</small>
            </div>
            <div className="mt-1 min-h-[15px] text-[11px] font-semibold text-ink-3">&nbsp;</div>
            <ul className="mt-4 flex flex-col gap-2.5">
              {PRICING_ROWS.map((row) => (
                <li key={row.label} className="flex items-start gap-2 text-[13px] text-ink-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-ink-3" />
                  <span>
                    <span className="font-semibold text-ink">{row.label}:</span> {row.free}
                  </span>
                </li>
              ))}
            </ul>
            <Button variant="ghost" className="mt-6 w-full justify-center" asChild>
              <Link href="/sign-in">Mulai Gratis</Link>
            </Button>
          </Reveal>

          <Reveal className="rounded-2xl border-2 border-accent bg-accent-bg p-6">
            <div className="flex items-center gap-2 font-display text-base font-bold">
              Pro
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-[9.5px] font-extrabold text-ink">
                POPULER
              </span>
            </div>
            <div className="mt-2 font-display text-[26px] font-bold">
              {pro.price}
              <small className="text-xs font-normal text-ink-3">/bulan</small>
            </div>
            <div className="mt-1 min-h-[15px] text-[11px] font-semibold text-accent-text">{pro.note}</div>
            <ul className="mt-4 flex flex-col gap-2.5">
              {PRICING_ROWS.map((row) => (
                <li key={row.label} className="flex items-start gap-2 text-[13px] text-ink">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-accent-deep" />
                  <span>
                    <span className="font-semibold">{row.label}:</span> {row.pro}
                  </span>
                </li>
              ))}
            </ul>
            <Button className="mt-6 w-full justify-center" onClick={onOpenCheckout}>
              Pilih Pro
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
