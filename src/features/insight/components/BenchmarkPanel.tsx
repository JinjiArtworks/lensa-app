import { computeBenchmarkDelta } from "../lib/insight-matcher";
import type { BenchmarkMetric } from "../types";

export function BenchmarkPanel({ category, metrics }: { category: string; metrics: BenchmarkMetric[] }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <h3 className="text-sm font-bold">Benchmark Industri</h3>
      <div className="mt-0.5 text-[11.5px] text-ink-3">Kategori: {category}</div>
      <div className="mt-3">
        {metrics.map((m) => {
          const delta = computeBenchmarkDelta(m);
          return (
            <div key={m.name} className="border-b border-line-2 py-2.5 last:border-b-0">
              <div className="mb-2 flex items-center justify-between gap-2.5">
                <span className="text-[12.5px] font-bold">{m.name}</span>
                <span className={`text-[11px] font-bold ${delta.better ? "text-green" : "text-red"}`}>
                  {delta.better ? "▲" : "▼"} {delta.pct}% {delta.better ? m.good : m.bad}
                </span>
              </div>
              <div className="mb-1.5 flex items-center gap-2.5 last:mb-0">
                <span className="w-[78px] shrink-0 text-[10.5px] text-ink-3">Bisnis kamu</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-bg">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${delta.youBarPct}%` }} />
                </span>
                <span className="w-[58px] shrink-0 text-right text-[11px] font-bold">{m.youText}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-[78px] shrink-0 text-[10.5px] text-ink-3">Rata-rata industri</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-bg">
                  <span className="block h-full rounded-full bg-gray" style={{ width: `${delta.indBarPct}%` }} />
                </span>
                <span className="w-[58px] shrink-0 text-right text-[11px] font-bold">{m.indText}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 border-t border-line-2 pt-2.5 text-[11px] leading-relaxed text-ink-3">
        Rata-rata industri dihitung dari bisnis sejenis dengan rentang spend mirip (simulasi).
      </div>
    </div>
  );
}
