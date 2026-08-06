"use client";

import { Lock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PLATFORM_LABELS, type PlatformKey } from "@/features/overview-dashboard/mock-data";

export type { PlatformKey };

// "all" is an aggregate single view (combined KPI/trend/campaigns), never two
// platforms rendered side by side — that's the Compare mode business-plan.md
// §9 cut from scope. Still one view at a time, picked from one dropdown.
export type DetailPlatformView = PlatformKey | "all";

const VIEW_LABELS: Record<DetailPlatformView, string> = {
  all: "Semua Platform",
  meta: PLATFORM_LABELS.meta.name,
  tiktok: PLATFORM_LABELS.tiktok.name,
};

const VIEW_ORDER: DetailPlatformView[] = ["all", "meta", "tiktok"];

export function PlatformSwitcher({
  active,
  onSelect,
  isLocked = () => false,
}: {
  active: DetailPlatformView;
  onSelect: (key: DetailPlatformView) => void;
  isLocked?: (key: DetailPlatformView) => boolean;
}) {
  return (
    <div className="mb-4 w-[210px]">
      <Select value={active} onValueChange={(v) => onSelect(v as DetailPlatformView)}>
        <SelectTrigger className="h-10 border-line bg-card text-[12.5px] font-semibold text-ink">
          <SelectValue>{VIEW_LABELS[active]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {VIEW_ORDER.map((key) => (
            <SelectItem key={key} value={key}>
              <span className="flex items-center gap-1.5">
                {VIEW_LABELS[key]}
                {isLocked(key) && <Lock className="size-3 shrink-0 text-ink-3" />}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
