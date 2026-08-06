import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProLockBadge({ tooltip, className }: { tooltip: string; className?: string }) {
  return (
    <span title={tooltip} className={cn("inline-flex shrink-0 items-center gap-1", className)}>
      <Lock className="size-3.5 text-ink-3" />
      <span className="rounded bg-accent-bg px-1 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-accent-text">
        Pro
      </span>
    </span>
  );
}
