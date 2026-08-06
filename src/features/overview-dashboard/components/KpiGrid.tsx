import type { OverviewData } from "../mock-data";

export function KpiCard({ label, value, cls, sub }: { label: string; value: string; cls: "up" | "down" | ""; sub: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="mb-2 text-xs text-ink-2">{label}</div>
      <div className="mb-1.5 text-xl font-extrabold tracking-tight">{value}</div>
      <div className={`text-[11px] font-semibold ${cls === "up" ? "text-green" : cls === "down" ? "text-red" : "text-ink-2"}`}>
        {sub}
      </div>
    </div>
  );
}

export function KpiGrid({ kpiRow1, kpiRow2 }: { kpiRow1: OverviewData["KPI_ROW_1"]; kpiRow2: OverviewData["KPI_ROW_2"] }) {
  return (
    <>
      <div className="mb-3 grid grid-cols-4 gap-3 max-[980px]:grid-cols-2">
        {kpiRow1.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>
      <div className="mb-3 grid grid-cols-4 gap-3 max-[980px]:grid-cols-2">
        {kpiRow2.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>
    </>
  );
}
