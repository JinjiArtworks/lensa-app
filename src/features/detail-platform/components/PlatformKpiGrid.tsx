import type { OverviewData } from "@/features/overview-dashboard/mock-data";
import type { PlatformKey } from "./PlatformSwitcher";

export function PlatformKpiGrid({
  platformKey,
  platforms,
}: {
  platformKey: PlatformKey;
  platforms: OverviewData["PLATFORMS"];
}) {
  const metrics = platforms[platformKey].metrics;

  return (
    <div className="mb-4 grid grid-cols-4 gap-3 max-[980px]:grid-cols-2">
      {Object.entries(metrics).map(([label, m]) => (
        <div key={label} className="rounded-2xl border border-line bg-card p-4">
          <div className="mb-2 text-xs text-ink-2">{label}</div>
          <div className="mb-1.5 text-xl font-extrabold tracking-tight">{m.value}</div>
          <div
            className={`text-[11px] font-semibold ${
              m.cls === "up" ? "text-green" : m.cls === "down" ? "text-red" : "text-ink-2"
            }`}
          >
            {m.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
