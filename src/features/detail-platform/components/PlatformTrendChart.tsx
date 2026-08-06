"use client";

import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

function PlatformTrendTooltip({
  active,
  payload,
  label,
  metricLabel,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  metricLabel?: string;
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  return (
    <div className="rounded-lg bg-ink px-2.5 py-1.5 text-[11.5px] font-bold tabular-nums text-white">
      <div>Hari {label}</div>
      {value !== undefined && (
        <div className="font-normal text-white/80">
          {metricLabel}: {value.toLocaleString("id-ID")}
        </div>
      )}
    </div>
  );
}

export function PlatformTrendChart({
  data,
  color,
  label,
}: {
  data: { day: string; spend: number; closing: number }[];
  color: string;
  label: string;
}) {
  const [metric, setMetric] = useState<"spend" | "closing">("spend");

  return (
    <div className="mb-4 rounded-2xl border border-line bg-card p-4">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
        <h3 className="text-sm font-bold">Tren Performa</h3>
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
      <ResponsiveContainer width="100%" height={170}>
        <AreaChart data={data}>
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9d9da6" }} axisLine={false} tickLine={false} />
          <Tooltip content={<PlatformTrendTooltip metricLabel={metric === "spend" ? "Spend" : "Closing"} />} />
          <Area type="monotone" dataKey={metric} stroke={color} fill={color} fillOpacity={0.12} strokeWidth={2.4} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-2">
        <i className="inline-block size-2.5 rounded-sm" style={{ background: color }} />
        {label}
      </div>
    </div>
  );
}
