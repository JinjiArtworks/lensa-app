"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PLATFORM_CHART_COLOR, type PlatformKey } from "../mock-data";
import type { OverviewData } from "../mock-data";

const KEY_BY_NAME: Record<string, PlatformKey> = { Meta: "meta", TikTok: "tiktok" };

function formatValue(metric: "ctr" | "cpa", value: number): string {
  return metric === "ctr" ? `${value.toFixed(1)}%` : `Rp${Math.round(value).toLocaleString("id-ID")}`;
}

function EfficiencyTooltip({
  active,
  payload,
  metric,
}: {
  active?: boolean;
  payload?: { payload: { name: string; value: number } }[];
  metric: "ctr" | "cpa";
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg bg-ink px-2.5 py-1.5 text-[11.5px] font-bold tabular-nums text-white">
      {point.name}
      <div className="font-normal text-white/80">{formatValue(metric, point.value)}</div>
    </div>
  );
}

export function PlatformEfficiencyChart({ chartData }: { chartData: OverviewData["EFFICIENCY_CHART_DATA"] }) {
  const [metric, setMetric] = useState<"ctr" | "cpa">("ctr");
  const data = chartData[metric];

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
        <h3 className="text-sm font-bold">Efisiensi Platform</h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setMetric("ctr")}
            className={`rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold ${
              metric === "ctr" ? "bg-accent text-ink" : "bg-bg text-ink-2"
            }`}
          >
            CTR
          </button>
          <button
            type="button"
            onClick={() => setMetric("cpa")}
            className={`rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold ${
              metric === "cpa" ? "bg-accent text-ink" : "bg-bg text-ink-2"
            }`}
          >
            CPA
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid horizontal={false} stroke="#f0f0f4" />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#9d9da6" }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11.5, fill: "#6b6b76" }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip content={<EfficiencyTooltip metric={metric} />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={PLATFORM_CHART_COLOR[KEY_BY_NAME[entry.name]]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
