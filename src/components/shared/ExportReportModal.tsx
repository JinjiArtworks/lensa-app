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
  period?: string;
}

function toPlainText(data: ExportReportData): string {
  return [
    `${data.scope} · ${data.period ?? "30 hari"}`,
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
  const [copying, setCopying] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function renderCardCanvas() {
    if (!cardRef.current) return null;
    const { default: html2canvas } = await import("html2canvas");
    return html2canvas(cardRef.current, { backgroundColor: "#ffffff", scale: 2 });
  }

  async function handleCopy() {
    setCopying(true);
    try {
      const canvas = await renderCardCanvas();
      if (!canvas) throw new Error("card not ready");
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob || typeof ClipboardItem === "undefined") throw new Error("image clipboard unsupported");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      showToast("Gambar report disalin ke clipboard");
    } catch {
      // Browsers without image-clipboard support (or a render failure) still get something useful.
      try {
        await navigator.clipboard.writeText(toPlainText(data));
        showToast("Browser ini belum dukung copy gambar — disalin sebagai teks");
      } catch {
        showToast("Gagal menyalin — coba lagi");
      }
    } finally {
      setCopying(false);
      onClose();
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const canvas = await renderCardCanvas();
      if (!canvas) throw new Error("card not ready");
      const { default: jsPDF } = await import("jspdf");
      // px_scaling hotfix required for `unit: "px"` to map 1 unit = 1 canvas
      // pixel — without it jsPDF applies a 96/72 scale factor and the PDF
      // page ends up ~1.33x larger than the canvas dimensions.
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
        hotfixes: ["px_scaling"],
      });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`lensa-report-${data.scope.toLowerCase().replace(/\s+/g, "-")}.pdf`);
      showToast("Report PDF diunduh");
    } catch {
      showToast("Gagal membuat PDF — coba lagi");
    } finally {
      setExporting(false);
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
            {`${data.scope} · ${data.period ?? "30 hari"}`.toUpperCase()}
          </div>
          <div className="mb-1 text-xl font-extrabold">{data.roas}</div>
          <div className="mb-2.5 text-xs text-ink-2">
            Spend {data.spend} · {data.closing} closing
          </div>
          <div className="border-t border-line pt-2.5 text-[11.5px] leading-relaxed text-ink-2">{data.note}</div>
          <div className="mt-2.5 text-right text-[10.5px] text-ink-3">via Lensa</div>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1 justify-center" disabled={copying} onClick={handleCopy}>
            {copying ? "Menyalin…" : "Copy"}
          </Button>
          <Button variant="ghost" className="flex-1 justify-center" disabled={exporting} onClick={handleExport}>
            {exporting ? "Menyiapkan…" : "Export"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
