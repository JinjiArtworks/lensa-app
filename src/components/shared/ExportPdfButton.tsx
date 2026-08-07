"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProLockBadge } from "@/components/shared/ProLockBadge";
import { ProUpgradeDialog } from "@/components/shared/ProUpgradeDialog";
import { useProGate } from "@/components/shared/use-pro-gate";
import { useUiStore } from "@/stores/ui";
import { captureMainContent } from "@/lib/page-capture";

export function ExportPdfButton({
  fileName = "report",
  label = "Export as PDF",
  disabled = false,
}: {
  fileName?: string;
  label?: string;
  disabled?: boolean;
}) {
  const showToast = useUiStore((s) => s.showToast);
  const { isFree } = useProGate();
  const [exporting, setExporting] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  async function handleClick() {
    if (isFree) {
      setUpgradeOpen(true);
      return;
    }
    setExporting(true);
    try {
      const canvas = await captureMainContent();
      if (!canvas) throw new Error("capture target not found");
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
      pdf.save(`lensa-report-${fileName}.pdf`);
      showToast("Report PDF diunduh");
    } catch {
      showToast("Gagal membuat PDF — coba lagi");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <Button variant="secondary" disabled={disabled || exporting} onClick={handleClick}>
        <FileDown className="size-4" />
        {exporting ? "Menyiapkan…" : label}
        {isFree && <ProLockBadge tooltip="Fitur Pro — upgrade buat export PDF" />}
      </Button>
      <ProUpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        title="Export as PDF terkunci"
        description="Export as PDF cuma tersedia di plan Pro. Upgrade buat buka akses."
      />
    </>
  );
}
