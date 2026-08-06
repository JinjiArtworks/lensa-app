import { Badge } from "@/components/ui/badge";
import { PLATFORM_LABELS, STATUS_LABEL, formatRupiah, type Campaign } from "@/features/overview-dashboard/mock-data";
import type { DetailPlatformView } from "../lib/detail-view";

export function PlatformCampaignTable({
  platformKey,
  campaigns,
}: {
  platformKey: DetailPlatformView;
  campaigns: Campaign[];
}) {
  const platformName = PLATFORM_LABELS[platformKey].name;
  const rows = campaigns.filter((c) => c.channel === platformName);

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <h3 className="mb-3.5 text-sm font-bold">Campaign di platform ini</h3>
      {rows.length === 0 ? (
        <div className="py-5 text-center text-xs text-ink-3">
          {platformName} tidak menjalankan campaign — platform ini dipakai untuk tracking, bukan iklan.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">Campaign</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-left text-[10.5px] uppercase text-ink-3">Status</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-right text-[10.5px] uppercase text-ink-3">Spend</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-right text-[10.5px] uppercase text-ink-3">CTR</th>
                <th className="border-b border-line-2 px-2 py-2.5 text-right text-[10.5px] uppercase text-ink-3">Closing</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.name} className="border-b border-line-2 last:border-b-0">
                  <td className="px-2 py-3 text-xs">{c.name}</td>
                  <td className="px-2 py-3">
                    <Badge variant={c.status}>{STATUS_LABEL[c.status]}</Badge>
                  </td>
                  <td className="px-2 py-3 text-right text-xs">{formatRupiah(c.spend)}</td>
                  <td className="px-2 py-3 text-right text-xs">{c.ctr}</td>
                  <td className="px-2 py-3 text-right text-xs">{c.conv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
