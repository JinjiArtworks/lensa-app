"use client";

import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Reveal } from "./Reveal";
import { TREND_METRICS } from "../mock-data";
import { computeTrendDelta } from "../lib/trend";
import type { TrendMetricKey } from "../types";

const TABS: TrendMetricKey[] = ["roas", "cpa", "ctr", "closing"];

function TrendTooltip({
  active,
  payload,
  format,
}: {
  active?: boolean;
  payload?: { payload: { week: number; value: number } }[];
  format: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg bg-ink px-2.5 py-1.5 text-[11.5px] font-bold tabular-nums text-white">
      Minggu {point.week} · {format(point.value)}
    </div>
  );
}

export function TrendChartSection() {
  const [metricKey, setMetricKey] = useState<TrendMetricKey>("roas");
  const metric = TREND_METRICS[metricKey];
  const delta = computeTrendDelta(metric);

  return (
    <section id="tren" className="py-16 md:py-[92px]">
      <div className="mx-auto max-w-[1100px] px-5">
        <Reveal className="mx-auto mb-[52px] max-w-[620px] text-center">
          <span className="text-[11.5px] font-bold uppercase tracking-wide text-accent-text">
            Tren Performa Mingguan
          </span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold tracking-tight md:text-[36px]">
            Pantau metrik yang paling penting buat bisnismu — semua dalam satu grafik.
          </h2>
          <p className="mt-3.5 text-[15.5px] leading-relaxed text-ink-2">
            Geser antar metrik buat lihat tren ROAS, CPA, CTR, dan Closing selama 12 minggu terakhir — semua dihitung
            dari data asli yang tersambung ke Lensa.
          </p>
        </Reveal>

        <Reveal className="rounded-[26px] border border-line bg-card p-5 shadow-sm md:p-7">
          <div className="mb-5 flex flex-wrap gap-1 rounded-[10px] bg-gray-bg p-1" role="tablist" aria-label="Pilih metrik">
            {TABS.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={metricKey === key}
                onClick={() => setMetricKey(key)}
                className={`rounded-[7px] px-4 py-2 text-[12.5px] font-bold transition-colors ${
                  metricKey === key ? "bg-card text-ink shadow-sm" : "text-ink-2"
                }`}
              >
                {TREND_METRICS[key].tabLabel}
              </button>
            ))}
          </div>

          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[11.5px] font-bold uppercase tracking-wide text-ink-3">{metric.label}</div>
              <div className="mt-1.5 flex items-baseline gap-2.5 font-display text-[28px] font-bold tabular-nums">
                {metric.format(delta.last)}
                <span className={`font-sans text-sm font-bold ${delta.isGood ? "text-green" : "text-red"}`}>
                  {delta.wentUp ? "▲" : "▼"} {delta.deltaPct}% vs minggu 1
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-2">
              <i className="inline-block size-2.5 rounded-sm bg-accent" />
              {metric.legend}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metric.data}>
              <XAxis
                dataKey="week"
                tickFormatter={(w) => `Minggu ${w}`}
                interval={2}
                tick={{ fontSize: 11, fill: "#9d9da6" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={["dataMin", "dataMax"]} />
              <Tooltip content={<TrendTooltip format={metric.format} />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#c98f00"
                fill="#f0b400"
                fillOpacity={0.18}
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: "#fff", stroke: "#c98f00", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#c98f00" }}
                isAnimationActive
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>

          <p className="sr-only">
            Grafik menunjukkan tren {metric.label.toLowerCase()} {delta.wentUp ? "naik" : "turun"} dari{" "}
            {metric.format(delta.first)} di minggu 1 menjadi {metric.format(delta.last)} di minggu 12.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
