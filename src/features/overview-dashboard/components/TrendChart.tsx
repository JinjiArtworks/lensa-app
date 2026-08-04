"use client";

import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis } from "recharts";
import { TREND_DATA } from "../mock-data";

export function TrendChart() {
  const [period, setPeriod] = useState<7 | 30>(7);
  const data = TREND_DATA[period];

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
        <h3 className="text-sm font-bold">Performance over time</h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setPeriod(7)}
            className={`rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold ${
              period === 7 ? "bg-accent text-ink" : "bg-bg text-ink-2"
            }`}
          >
            7 hari
          </button>
          <button
            type="button"
            onClick={() => setPeriod(30)}
            className={`rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold ${
              period === 30 ? "bg-accent text-ink" : "bg-bg text-ink-2"
            }`}
          >
            30 hari
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <AreaChart data={data}>
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9d9da6" }} axisLine={false} tickLine={false} />
          <Area type="monotone" dataKey="current" stroke="#f0b400" fill="#f0b400" fillOpacity={0.12} strokeWidth={2.4} />
          <Area
            type="monotone"
            dataKey="previous"
            stroke="#ffe08a"
            fill="transparent"
            strokeWidth={2}
            strokeDasharray="5 4"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-3.5">
        <span className="flex items-center gap-1.5 text-[11px] text-ink-2">
          <i className="inline-block size-2.5 rounded-sm bg-[#f0b400]" />
          Spend (Sekarang)
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-ink-2">
          <i className="inline-block size-2.5 rounded-sm bg-[#ffe08a]" />
          Spend (Sebelumnya)
        </span>
      </div>
    </div>
  );
}
