import { InsightCard } from "./InsightCard";
import type { InsightItem } from "../types";

export function InsightGrid({ items }: { items: InsightItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-card py-10 text-center text-xs text-ink-3">
        Tidak ada insight yang cocok dengan filter ini.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3.5 max-[980px]:grid-cols-1">
      {items.map((item) => (
        <InsightCard key={item.id} item={item} />
      ))}
    </div>
  );
}
