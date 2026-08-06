import { PLATFORM_LABELS, type PlatformKey } from "@/features/overview-dashboard/mock-data";

export type DetailPlatformView = PlatformKey;

export const DETAIL_VIEW_LABELS: Record<DetailPlatformView, string> = {
  meta: PLATFORM_LABELS.meta.name,
  tiktok: PLATFORM_LABELS.tiktok.name,
};

export const DETAIL_VIEW_ORDER: DetailPlatformView[] = ["meta", "tiktok"];
