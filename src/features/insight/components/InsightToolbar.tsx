import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_FILTER_OPTIONS, PLATFORM_FILTER_OPTIONS } from "../mock-data";
import type { InsightItem } from "../types";

export function InsightToolbar({
  platform,
  onPlatformChange,
  category,
  onCategoryChange,
}: {
  platform: "all" | "meta" | "tiktok";
  onPlatformChange: (v: "all" | "meta" | "tiktok") => void;
  category: "all" | InsightItem["category"];
  onCategoryChange: (v: "all" | InsightItem["category"]) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5">
      <Select value={platform} onValueChange={(v) => onPlatformChange(v as "all" | "meta" | "tiktok")}>
        <SelectTrigger className="h-9 w-[168px] border-line bg-card text-xs font-semibold text-ink-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PLATFORM_FILTER_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
