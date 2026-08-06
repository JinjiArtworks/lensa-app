"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PLATFORM_CHART_COLOR, PLATFORM_LABELS, type PlatformKey } from "../mock-data";
import type { OverviewData } from "../mock-data";

const KEY_BY_NAME: Record<string, PlatformKey> = { Meta: "meta", TikTok: "tiktok" };

function formatValue(metric: "spend" | "closing", value: number): string {
  return metric === "spend" ? `Rp${value.toLocaleString("id-ID")}` : `${value.toLocaleString("id-ID")} closing`;
}

function ShareTooltip({
  active,
  payload,
  metric,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { pct: number } }[];
  metric: "spend" | "closing";
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  return (
    <div className="rounded-lg bg-ink px-2.5 py-1.5 text-[11.5px] font-bold tabular-nums text-white">
      {point.name} · {point.payload.pct.toFixed(0)}%
      <div className="font-normal text-white/80">{formatValue(metric, point.value)}</div>
    </div>
  );
}

export function PlatformShareChart({ chartData }: { chartData: OverviewData["CHANNEL_CHART_DATA"] }) {
  const [metric, setMetric] = useState<"spend" | "closing">("spend");
  const raw = chartData[metric];
  const total = raw.reduce((sum, entry) => sum + entry.value, 0);
  const data = raw.map((entry) => ({ ...entry, pct: total > 0 ? (entry.value / total) * 100 : 0 }));

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
        <h3 className="text-sm font-bold">Kontribusi Platform</h3>
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
      <div className="flex items-center gap-4 max-[560px]:flex-col">
        <ResponsiveContainer width="100%" height={190} className="max-w-[190px]">
          <PieChart>
            <Tooltip content={<ShareTooltip metric={metric} />} />
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3} strokeWidth={0}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={PLATFORM_CHART_COLOR[KEY_BY_NAME[entry.name]]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-1 flex-col gap-2.5">
          {data.map((entry) => {
            const key = KEY_BY_NAME[entry.name];
            return (
              <div key={entry.name} className="flex items-center justify-between gap-2 text-[11.5px]">
                <span className="flex items-center gap-1.5 font-semibold text-ink-2">
                  <i className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: PLATFORM_CHART_COLOR[key] }} />
                  {PLATFORM_LABELS[key].name}
                </span>
                <span className="font-bold tabular-nums text-ink">{entry.pct.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
