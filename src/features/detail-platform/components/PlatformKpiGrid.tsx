import { KpiCard } from "@/features/overview-dashboard/components/KpiGrid";

export interface KpiEntry {
  label: string;
  value: string;
  cls: "up" | "down" | "";
  sub: string;
}

export function PlatformKpiGrid({ entries }: { entries: KpiEntry[] }) {
  const row1 = entries.slice(0, 4);
  const row2 = entries.slice(4);

  return (
    <>
      <div className="mb-3 grid grid-cols-4 gap-3 max-[980px]:grid-cols-2">
        {row1.map((e) => (
          <KpiCard key={e.label} {...e} />
        ))}
      </div>
      <div className="mb-3 grid grid-cols-4 gap-3 max-[980px]:grid-cols-2">
        {row2.map((e) => (
          <KpiCard key={e.label} {...e} />
        ))}
      </div>
    </>
  );
}
