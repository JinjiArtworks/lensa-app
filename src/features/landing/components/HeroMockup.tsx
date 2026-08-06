"use client";

import { useRef, useState } from "react";
import { animate } from "framer-motion";
import { HERO_PLATFORM_DATA } from "../mock-data";
import type { HeroPlatformKey } from "../types";

const TABS: { key: HeroPlatformKey; label: string }[] = [
  { key: "meta", label: "Meta Ads" },
  { key: "tiktok", label: "TikTok Ads" },
];

// v is in juta rupiah (millions), same convention as overview-dashboard/lib/kpi.ts formatJuta.
function formatSpend(v: number) {
  return "Rp" + Math.round(v * 1_000_000).toLocaleString("id-ID");
}
function formatRoas(v: number) {
  return v.toFixed(1).replace(".", ",") + "x";
}

export function HeroMockup() {
  const [platform, setPlatform] = useState<HeroPlatformKey>("meta");
  const data = HERO_PLATFORM_DATA[platform];

  // Raw numeric refs (not the formatted display strings) are what each new
  // animate() call tweens from, so switching tabs mid-animation is always
  // based on an exact number, never a re-parsed display string.
  const spendRef = useRef(data.spendValue);
  const roasRef = useRef(data.roasValue);
  const [spendText, setSpendText] = useState(formatSpend(data.spendValue));
  const [roasText, setRoasText] = useState(formatRoas(data.roasValue));

  function handlePlatformChange(next: HeroPlatformKey) {
    setPlatform(next);
    const nextData = HERO_PLATFORM_DATA[next];
    animate(spendRef.current, nextData.spendValue, {
      duration: 0.5,
      onUpdate: (v) => {
        spendRef.current = v;
        setSpendText(formatSpend(v));
      },
    });
    animate(roasRef.current, nextData.roasValue, {
      duration: 0.5,
      onUpdate: (v) => {
        roasRef.current = v;
        setRoasText(formatRoas(v));
      },
    });
  }

  const maxBar = Math.max(...data.bars);

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-x-5 -inset-y-14 z-0 blur-md"
        style={{
          background:
            "radial-gradient(closest-side, rgba(240,180,0,.30), transparent 70%) 30% 35% / 65% 65% no-repeat, radial-gradient(closest-side, rgba(240,180,0,.20), transparent 72%) 70% 60% / 60% 60% no-repeat",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 rounded-[26px] border border-line bg-card p-5 shadow-[0_30px_70px_-30px_rgba(22,22,26,.32),0_10px_30px_-14px_rgba(240,180,0,.22)]">
        <div className="mb-3.5 flex items-center justify-between gap-2.5">
          <span className="text-[10.5px] font-bold tracking-wide text-ink-3">DASHBOARD · TOKO BAJU SINTA</span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-green-bg px-1.5 py-0.5 text-[9.5px] font-extrabold text-green">
            <span className="size-1.5 rounded-full bg-green" />
            LIVE
          </span>
        </div>

        <div className="mb-4 flex gap-1.5 rounded-[10px] bg-gray-bg p-1" role="tablist" aria-label="Pilih platform contoh">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={platform === tab.key}
              onClick={() => handlePlatformChange(tab.key)}
              className={`flex-1 rounded-lg py-2 text-[12.5px] font-bold transition-colors ${
                platform === tab.key ? "bg-card text-ink shadow-sm" : "text-ink-2"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-[10px] border border-line-2 bg-bg p-3">
            <span className="block text-[10px] font-bold tracking-wide text-ink-3">TOTAL SPEND</span>
            <span className="mt-1 block font-display text-xl font-bold tabular-nums">{spendText}</span>
            <span className={`mt-0.5 block text-[10.5px] font-bold ${data.spendUp ? "text-green" : "text-red"}`}>
              {data.spendDelta}
            </span>
          </div>
          <div className="rounded-[10px] border border-line-2 bg-bg p-3">
            <span className="block text-[10px] font-bold tracking-wide text-ink-3">ROAS</span>
            <span className="mt-1 block font-display text-xl font-bold tabular-nums">{roasText}</span>
            <span className={`mt-0.5 block text-[10.5px] font-bold ${data.roasUp ? "text-green" : "text-red"}`}>
              {data.roasDelta}
            </span>
          </div>
        </div>

        <div className="mb-3 flex h-[74px] items-end gap-1.5 rounded-[10px] border border-line-2 bg-bg p-3" aria-hidden="true">
          {data.bars.map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-[3px] bg-accent transition-[height] duration-300"
              style={{ height: `${(v / maxBar) * 64}px` }}
            />
          ))}
        </div>

        <div className="flex items-start gap-2 rounded-[10px] border border-accent bg-accent-bg p-2.5 text-[11.5px] font-semibold leading-relaxed text-accent-text">
          {data.insight}
        </div>
      </div>
    </div>
  );
}
