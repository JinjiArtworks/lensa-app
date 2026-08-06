import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProLockBadge({ tooltip, className }: { tooltip: string; className?: string }) {
  return (
    <span title={tooltip} className={cn("inline-flex shrink-0 items-center justify-center", className)}>
      <Lock className="size-3.5 text-ink-3" />
    </span>
  );
}
