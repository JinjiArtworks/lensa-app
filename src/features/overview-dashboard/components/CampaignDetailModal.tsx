import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CREATIVES, formatRupiah, type Campaign } from "../mock-data";

const CREA_BADGE: Record<string, "active" | "archived" | "pending"> = {
  Winning: "active",
  Fatigue: "archived",
  Baru: "pending",
};

export function CampaignDetailModal({
  campaign,
  onClose,
}: {
  campaign: Campaign | null;
  onClose: () => void;
}) {
  const creatives = campaign ? CREATIVES[campaign.name] ?? [] : [];

  return (
    <Dialog open={!!campaign} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{campaign?.name}</DialogTitle>
        </DialogHeader>
        {campaign && (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-lg bg-bg p-2.5">
                <div className="text-[10.5px] text-ink-3">Spend</div>
                <div className="mt-0.5 text-[15px] font-extrabold">{formatRupiah(campaign.spend)}</div>
              </div>
              <div className="rounded-lg bg-bg p-2.5">
                <div className="text-[10.5px] text-ink-3">CTR</div>
                <div className="mt-0.5 text-[15px] font-extrabold">{campaign.ctr}</div>
              </div>
              <div className="rounded-lg bg-bg p-2.5">
                <div className="text-[10.5px] text-ink-3">Closing</div>
                <div className="mt-0.5 text-[15px] font-extrabold">{campaign.conv}</div>
              </div>
              <div className="rounded-lg bg-bg p-2.5">
                <div className="text-[10.5px] text-ink-3">Channel</div>
                <div className="mt-0.5 text-[15px] font-extrabold">{campaign.channel}</div>
              </div>
            </div>
            <div className="rounded-lg bg-accent-bg p-3 text-xs leading-relaxed text-accent-text">
              AI note: performa campaign ini masih dalam rentang normal — belum ada anomali terdeteksi.
            </div>
            <div className="border-t border-line-2 pt-3">
              <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-2">Creative Performance</h4>
              {creatives.length === 0 ? (
                <div className="py-2.5 text-xs text-ink-3">Belum ada data creative untuk campaign ini.</div>
              ) : (
                creatives.map((cr) => (
                  <div key={cr.name} className="flex items-center gap-2.5 border-b border-line-2 py-2.5 last:border-b-0">
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-semibold">{cr.name}</div>
                      <div className="mt-0.5 text-[11px] text-ink-3">CTR {cr.ctr}</div>
                    </div>
                    <Badge variant={CREA_BADGE[cr.status]}>{cr.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
