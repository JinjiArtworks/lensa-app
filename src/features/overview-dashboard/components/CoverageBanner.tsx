import { AlertCircle } from "lucide-react";
import { CONNECTED_PLATFORM_COUNT, TOTAL_PLATFORM_CATALOG } from "../mock-data";

export function CoverageBanner() {
  return (
    <div className="mb-3.5 flex items-center gap-2.5 rounded-2xl bg-accent-bg px-4 py-2.5">
      <AlertCircle className="size-4 shrink-0 text-accent" />
      <div className="text-xs text-accent-text">
        Metrik di bawah ini adalah gabungan dari <b>{CONNECTED_PLATFORM_COUNT} dari {TOTAL_PLATFORM_CATALOG}</b>{" "}
        platform yang terhubung (Meta Ads, TikTok Ads) — sudah mencakup semua data platformmu.
      </div>
    </div>
  );
}
