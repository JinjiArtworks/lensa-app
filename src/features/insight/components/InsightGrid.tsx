import { InsightCard } from "./InsightCard";
import { LockedCategorySection } from "./LockedCategorySection";
import type { InsightCategory, InsightItem } from "../types";

// Positif first (always open to Free), then the 2 Pro-only categories —
// same order regardless of plan, so Pro users just see all 3 groups open.
const CATEGORY_ORDER: InsightCategory[] = ["positif", "anomali", "rekomendasi"];

export function InsightGrid({
  items,
  isFree,
  onUpgradeClick,
}: {
  items: InsightItem[];
  isFree: boolean;
  onUpgradeClick: () => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-card py-10 text-center text-xs text-ink-3">
        Tidak ada insight yang cocok dengan filter ini.
      </div>
    );
  }

  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: items.filter((it) => it.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-3.5">
      {groups.map((group) =>
        isFree && group.category !== "positif" ? (
          <LockedCategorySection
            key={group.category}
            category={group.category}
            count={group.items.length}
            onUpgradeClick={onUpgradeClick}
          />
        ) : (
          <div key={group.category} className="grid grid-cols-2 gap-3.5 max-[980px]:grid-cols-1">
            {group.items.map((item) => (
              <InsightCard key={item.id} item={item} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
