"use client";

import { Reveal } from "./Reveal";
import { useCountUp } from "../lib/useCountUp";

function CountStat({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { ref, value } = useCountUp(target);
  return (
    <div className="p-2 text-center">
      <div className="font-display text-[2.2rem] font-bold tabular-nums text-accent-deep">
        <span ref={ref}>{value}</span>
        {suffix}
      </div>
      <div className="mx-auto mt-2 max-w-[190px] text-[12.5px] leading-snug text-ink-2">{label}</div>
    </div>
  );
}

function StaticStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="p-2 text-center">
      <div className="font-display text-[2.2rem] font-bold text-accent-deep">{value}</div>
      <div className="mx-auto mt-2 max-w-[190px] text-[12.5px] leading-snug text-ink-2">{label}</div>
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="border-y border-line bg-card py-16 md:py-[92px]">
      <div className="mx-auto max-w-[1100px] px-5">
        <Reveal className="mx-auto mb-[52px] max-w-[620px] text-center">
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-accent-text">
            Hasil yang Bisa Diukur
          </span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold tracking-tight md:text-[36px]">
            Bukan cuma dashboard yang rapi — ini dampaknya buat bisnismu.
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <CountStat target={32} suffix="%" label="Rata-rata penurunan CPA dalam 90 hari pertama pemakaian" />
          <CountStat target={5} suffix=" menit" label="Waktu review harian — sebelumnya bisa lebih dari 1 jam" />
          <StaticStat value="2 Platform" label="Meta Ads & TikTok Ads tergabung otomatis dalam satu dashboard" />
          <StaticStat value="Real-time" label="Data selalu diperbarui lewat sync otomatis" />
        </div>
      </div>
    </section>
  );
}
