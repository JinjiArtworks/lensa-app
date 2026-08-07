"use client";

import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProLockBadge } from "@/components/shared/ProLockBadge";
import { ProUpgradeDialog } from "@/components/shared/ProUpgradeDialog";
import { useProGate } from "@/components/shared/use-pro-gate";
import { useUiStore } from "@/stores/ui";
import { captureMainContent } from "@/lib/page-capture";

export function CopyAsReportButton({
  label = "Copy as report",
  disabled = false,
}: {
  label?: string;
  disabled?: boolean;
}) {
  const showToast = useUiStore((s) => s.showToast);
  const { isFree } = useProGate();
  const [copying, setCopying] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  async function handleClick() {
    if (isFree) {
      setUpgradeOpen(true);
      return;
    }
    setCopying(true);
    try {
      const canvas = await captureMainContent();
      if (!canvas) throw new Error("capture target not found");
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob || typeof ClipboardItem === "undefined") throw new Error("image clipboard unsupported");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      showToast("Screenshot halaman disalin ke clipboard");
    } catch {
      showToast("Gagal menyalin screenshot — coba lagi");
    } finally {
      setCopying(false);
    }
  }

  return (
    <>
      <Button variant="secondary" disabled={disabled || copying} onClick={handleClick}>
        <ClipboardCheck className="size-4" />
        {copying ? "Menyalin…" : label}
        {isFree && <ProLockBadge tooltip="Fitur Pro — upgrade buat copy as report" />}
      </Button>
      <ProUpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        title="Copy as report terkunci"
        description="Copy as report cuma tersedia di plan Pro. Upgrade buat buka akses."
      />
    </>
  );
}
