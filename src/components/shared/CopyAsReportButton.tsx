"use client";

import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportReportModal, type ExportReportData } from "@/components/shared/ExportReportModal";

export function CopyAsReportButton({
  data,
  label = "Copy as report",
  disabled = false,
}: {
  data: ExportReportData;
  label?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" disabled={disabled} onClick={() => setOpen(true)}>
        <ClipboardCheck className="size-4" />
        {label}
      </Button>
      <ExportReportModal open={open} onClose={() => setOpen(false)} data={data} />
    </>
  );
}
