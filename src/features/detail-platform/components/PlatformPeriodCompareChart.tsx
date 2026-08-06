"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCount, formatJuta, type PlatformRaw } from "@/features/overview-dashboard/lib/kpi";

type Metric = "spend" | "closing";

function formatValue(metric: Metric, value: number): string {
  return metric === "spend" ? formatJuta(value) : formatCount(value);
}

function CompareTooltip({
  active,
  payload,
  metric,
}: {
  active?: boolean;
  payload?: { payload: { name: string; value: number } }[];
  metric: Metric;
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

export function PlatformPeriodCompareChart({
  current,
  previous,
  color,
}: {
  current: PlatformRaw;
  previous: PlatformRaw;
  color: string;
}) {
  const [metric, setMetric] = useState<Metric>("spend");
  const data = [
    { name: "Periode Ini", value: current[metric] },
    { name: "Periode Lalu", value: previous[metric] },
  ];

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
        <h3 className="text-sm font-bold">Perbandingan Periode</h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setMetric("spend")}
            className={`rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold ${
              metric === "spend" ? "bg-accent text-ink" : "bg-bg text-ink-2"
            }`}
          >
            Spend
          </button>
          <button
            type="button"
            onClick={() => setMetric("closing")}
            className={`rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold ${
              metric === "closing" ? "bg-accent text-ink" : "bg-bg text-ink-2"
            }`}
          >
            Closing
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
            width={72}
          />
          <Tooltip content={<CompareTooltip metric={metric} />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
            <Cell fill={color} />
            <Cell fill={color} fillOpacity={0.35} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
