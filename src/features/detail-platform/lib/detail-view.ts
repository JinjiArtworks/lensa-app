import { PLATFORM_LABELS, type PlatformKey } from "@/features/overview-dashboard/mock-data";

// "all" is an aggregate single view (combined KPI/trend/campaigns), never two
// platforms rendered side by side — that's the Compare mode business-plan.md
// §9 cut from scope. Still one view at a time, picked from the sidebar submenu.
export type DetailPlatformView = PlatformKey | "all";

export const DETAIL_VIEW_LABELS: Record<DetailPlatformView, string> = {
  all: "Semua Platform",
  meta: PLATFORM_LABELS.meta.name,
  tiktok: PLATFORM_LABELS.tiktok.name,
};

export const DETAIL_VIEW_ORDER: DetailPlatformView[] = ["all", "meta", "tiktok"];
