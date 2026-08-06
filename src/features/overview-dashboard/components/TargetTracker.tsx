"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TARGETS, type OverviewData } from "../mock-data";
import { SetTargetModal } from "./SetTargetModal";

interface Row {
  name: string;
  cur: number;
  tgt: number;
  fmt: (v: number) => string;
}

export function TargetTracker({
  actuals,
  title = "Target Bulan Ini",
  subtitle = "Progres aktual dibanding target yang kamu set.",
}: {
  actuals: OverviewData["ACTUALS"];
  title?: string;
  subtitle?: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  // Computed inside the component (not as a module-level constant) so that saving new
  // targets in SetTargetModal — which mutates the TARGETS object in place — is reflected
  // here on the next render, instead of being frozen to the values captured at module load.
  const ROWS: Row[] = [
    { name: "ROAS", cur: actuals.roas, tgt: TARGETS.roas, fmt: (v) => `${v.toFixed(1)}x` },
    { name: "Closing", cur: actuals.closing, tgt: TARGETS.closing, fmt: (v) => `${Math.round(v)} transaksi` },
  ];
  return (
    <div className="mb-4 rounded-2xl border border-line bg-card p-4">
      <div className="mb-3.5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold">{title}</h3>
          <div className="mt-0.5 text-[11.5px] text-ink-3">{subtitle}</div>
        </div>
        <Button variant="ghost" onClick={() => setModalOpen(true)}>
          Set target
        </Button>
      </div>
      {ROWS.map((row) => {
        const pct = row.tgt > 0 ? Math.round((row.cur / row.tgt) * 100) : 0;
        const clamped = Math.max(0, Math.min(100, pct));
        const note = pct >= 100 ? "Target tercapai — mantap!" : `${100 - pct}% lagi menuju target bulan ini`;
        return (
          <div key={row.name} className="border-b border-line-2 py-2.5 last:border-b-0">
            <div className="mb-1.5 flex items-baseline justify-between gap-2.5">
              <span className="text-[12.5px] font-bold">{row.name}</span>
              <span className="text-[11.5px] text-ink-2">
                <b className="text-ink">
                  {row.fmt(row.cur)} / target {row.fmt(row.tgt)}
                </b>
              </span>
            </div>
            <Progress value={clamped} className="h-2" />
            <div className="mt-1.5 text-[11px] text-ink-3">
              {pct}% tercapai · {note}
            </div>
          </div>
        );
      })}
      <SetTargetModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
