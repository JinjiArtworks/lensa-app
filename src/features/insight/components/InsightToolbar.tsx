import { CATEGORY_FILTER_OPTIONS, PERIOD_OPTIONS, PLATFORM_FILTER_OPTIONS } from "../mock-data";
import type { InsightItem, PeriodKey } from "../types";

export function InsightToolbar({
  period,
  onPeriodChange,
  platform,
  onPlatformChange,
  category,
  onCategoryChange,
}: {
  period: PeriodKey;
  onPeriodChange: (v: PeriodKey) => void;
  platform: "all" | "meta" | "tiktok";
  onPlatformChange: (v: "all" | "meta" | "tiktok") => void;
  category: "all" | InsightItem["category"];
  onCategoryChange: (v: "all" | InsightItem["category"]) => void;
}) {
  return (
    <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
      <label className="flex items-center gap-1.5 text-xs text-ink-2">
        Periode:
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value as PeriodKey)}
          className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs font-medium text-ink"
        >
          {PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-1.5 text-xs text-ink-2">
        Platform:
        <select
          value={platform}
          onChange={(e) => onPlatformChange(e.target.value as "all" | "meta" | "tiktok")}
          className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs font-medium text-ink"
        >
          {PLATFORM_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onCategoryChange(opt.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
              category === opt.value ? "border-accent bg-accent text-ink" : "border-line bg-card text-ink-2"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
