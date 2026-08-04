import Link from "next/link";
import { AlertCircle } from "lucide-react";
import type { OverviewData } from "../mock-data";
import { shouldShowProactiveAlert } from "../lib/proactive-alert";

export function ProactiveAlertCard({ platforms }: { platforms: OverviewData["PLATFORMS"] }) {
  const alert = shouldShowProactiveAlert(platforms);
  if (!alert.show) return null;

  return (
    <Link
      href="/insight"
      className="mb-3.5 flex cursor-pointer items-center gap-3 rounded-2xl border-l-4 border-red bg-card p-4"
    >
      <AlertCircle className="size-[17px] shrink-0 text-red" />
      <div className="flex-1 text-[12.5px] text-ink-2">
        <b className="text-ink">
          Spend {alert.platformName} naik {alert.spendPct}%
        </b>{" "}
        tapi closing stagnan minggu ini — cek AI Insight untuk saran.
      </div>
      <span className="whitespace-nowrap text-xs font-bold text-accent">Lihat detail →</span>
    </Link>
  );
}
