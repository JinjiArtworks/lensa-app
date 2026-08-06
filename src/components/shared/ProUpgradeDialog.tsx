"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ProSwapAction {
  label: string;
  pending: boolean;
  onConfirm: () => void;
}

export function ProUpgradeDialog({
  open,
  onOpenChange,
  title,
  description,
  onUpgrade,
  swapAction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  onUpgrade?: () => void;
  swapAction?: ProSwapAction;
}) {
  const router = useRouter();

  function handleUpgrade() {
    onOpenChange(false);
    if (onUpgrade) onUpgrade();
    else router.push("/billing");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="mb-4 text-[12.5px] leading-relaxed text-ink-2">{description}</p>
        <div className="flex flex-col gap-2">
          {swapAction && (
            <Button disabled={swapAction.pending} onClick={swapAction.onConfirm} className="w-full justify-center">
              {swapAction.label}
            </Button>
          )}
          <Button variant="outline" className="w-full justify-center" onClick={handleUpgrade}>
            Upgrade ke Pro
          </Button>
          <Button variant="ghost" className="w-full justify-center" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
