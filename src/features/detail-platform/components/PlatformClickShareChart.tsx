"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { PlatformRaw } from "@/features/overview-dashboard/lib/kpi";

function ShareTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { pct: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  return (
    <div className="rounded-lg bg-ink px-2.5 py-1.5 text-[11.5px] font-bold tabular-nums text-white">
      {point.name} · {point.payload.pct.toFixed(1)}%
      <div className="font-normal text-white/80">{Math.round(point.value).toLocaleString("id-ID")} impresi</div>
    </div>
  );
}

export function PlatformClickShareChart({ current, color }: { current: PlatformRaw; color: string }) {
  const impresi = current.impresi * 1000;
  const klik = current.klik;
  const tidakDiklik = Math.max(0, impresi - klik);
  const data = [
    { name: "Diklik", value: klik, pct: impresi > 0 ? (klik / impresi) * 100 : 0 },
    { name: "Tidak diklik", value: tidakDiklik, pct: impresi > 0 ? (tidakDiklik / impresi) * 100 : 0 },
  ];

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
        <h3 className="text-sm font-bold">Efisiensi Klik</h3>
        <span className="text-[11px] text-ink-3">dari total impresi</span>
      </div>
      <div className="flex items-center gap-4 max-[560px]:flex-col">
        <ResponsiveContainer width="100%" height={190} className="max-w-[190px]">
          <PieChart>
            <Tooltip content={<ShareTooltip />} />
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3} strokeWidth={0}>
              <Cell fill={color} />
              <Cell fill="#e6e6ea" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-1 flex-col gap-2.5">
          {data.map((entry, i) => (
            <div key={entry.name} className="flex items-center justify-between gap-2 text-[11.5px]">
              <span className="flex items-center gap-1.5 font-semibold text-ink-2">
                <i className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: i === 0 ? color : "#e6e6ea" }} />
                {entry.name}
              </span>
              <span className="font-bold tabular-nums text-ink">{entry.pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
