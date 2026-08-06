import type { OverviewData } from "@/features/overview-dashboard/mock-data";
import { KpiCard } from "@/features/overview-dashboard/components/KpiGrid";
import type { PlatformKey } from "./PlatformSwitcher";

export function PlatformKpiGrid({
  platformKey,
  platforms,
}: {
  platformKey: PlatformKey;
  platforms: OverviewData["PLATFORMS"];
}) {
  const entries = Object.entries(platforms[platformKey].metrics);
  const row1 = entries.slice(0, 4);
  const row2 = entries.slice(4);

  return (
    <>
      <div className="mb-3 grid grid-cols-4 gap-3 max-[980px]:grid-cols-2">
        {row1.map(([label, m]) => (
          <KpiCard key={label} label={label} {...m} />
        ))}
      </div>
      <div className="mb-3 grid grid-cols-4 gap-3 max-[980px]:grid-cols-2">
        {row2.map(([label, m]) => (
          <KpiCard key={label} label={label} {...m} />
        ))}
      </div>
    </>
  );
}
