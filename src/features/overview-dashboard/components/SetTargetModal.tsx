"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TARGETS } from "../mock-data";

export function SetTargetModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [roas, setRoas] = useState(String(TARGETS.roas));
  const [closing, setClosing] = useState(String(TARGETS.closing));

  function handleSave() {
    const r = parseFloat(roas);
    const c = parseInt(closing, 10);
    if (isNaN(r) || r <= 0 || isNaN(c) || c <= 0) return;
    // Task 3's TARGETS is a plain object for this UI-only phase — real persistence
    // (Firestore) is wired in the later data-layer plan, not here.
    TARGETS.roas = r;
    TARGETS.closing = c;
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set target bulan ini</DialogTitle>
        </DialogHeader>
        <div className="mb-3.5 text-xs leading-relaxed text-ink-2">
          Target dipakai buat ngukur progres di dashboard. Bisa diubah kapan saja.
        </div>
        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-semibold text-ink-2">Target ROAS (x)</span>
          <input
            type="number"
            step="0.1"
            value={roas}
            onChange={(e) => setRoas(e.target.value)}
            className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-[13px]"
          />
        </label>
        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-semibold text-ink-2">Target Closing (transaksi)</span>
          <input
            type="number"
            step="1"
            value={closing}
            onChange={(e) => setClosing(e.target.value)}
            className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-[13px]"
          />
        </label>
        <div className="flex gap-2">
          <Button className="flex-1 justify-center" onClick={handleSave}>
            Simpan target
          </Button>
          <Button variant="ghost" className="flex-1 justify-center" onClick={onClose}>
            Batal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
