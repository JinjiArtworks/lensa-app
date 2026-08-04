"use client";

import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui";

export interface ExportReportData {
  scope: string;
  roas: string;
  spend: string;
  closing: string;
  note: string;
}

function toPlainText(data: ExportReportData): string {
  return [
    `${data.scope} · 30 hari`,
    data.roas,
    `Spend ${data.spend} · ${data.closing} closing`,
    "",
    data.note,
    "",
    "via Lensa",
  ].join("\n");
}

export function ExportReportModal({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: ExportReportData;
}) {
  const showToast = useUiStore((s) => s.showToast);
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(toPlainText(data));
      showToast("Disalin ke clipboard");
    } catch {
      showToast("Gagal menyalin — coba lagi atau copy manual");
    }
    onClose();
  }

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, { backgroundColor: "#ffffff", scale: 2 });
      const link = document.createElement("a");
      link.download = `lensa-report-${data.scope.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("Gambar diunduh");
    } catch {
      showToast("Gagal membuat gambar — coba lagi");
    } finally {
      setDownloading(false);
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Copy as report</DialogTitle>
        </DialogHeader>
        <div ref={cardRef} className="mb-3.5 rounded-xl border border-line bg-bg p-4">
          <div className="mb-2 text-[10.5px] tracking-wide text-ink-3">
            {`${data.scope} · 30 HARI`.toUpperCase()}
          </div>
          <div className="mb-1 text-xl font-extrabold">{data.roas}</div>
          <div className="mb-2.5 text-xs text-ink-2">
            Spend {data.spend} · {data.closing} closing
          </div>
          <div className="border-t border-line pt-2.5 text-[11.5px] leading-relaxed text-ink-2">{data.note}</div>
          <div className="mt-2.5 text-right text-[10.5px] text-ink-3">via Lensa</div>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1 justify-center" onClick={handleCopy}>
            Copy
          </Button>
          <Button variant="ghost" className="flex-1 justify-center" disabled={downloading} onClick={handleDownload}>
            {downloading ? "Menyiapkan…" : "Download"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
