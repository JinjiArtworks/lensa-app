import { PLATFORM_LABELS, type PlatformKey } from "@/features/overview-dashboard/mock-data";
import { ProLockBadge } from "@/components/shared/ProLockBadge";

export type { PlatformKey };

export function PlatformSwitcher({
  active,
  onSelect,
  isLocked = () => false,
}: {
  active: PlatformKey;
  onSelect: (key: PlatformKey) => void;
  isLocked?: (key: PlatformKey) => boolean;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {(Object.keys(PLATFORM_LABELS) as PlatformKey[]).map((key) => {
        const p = PLATFORM_LABELS[key];
        const locked = isLocked(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[12.5px] font-semibold ${
              key === active
                ? "border-accent bg-accent text-ink"
                : locked
                  ? "border-line bg-gray-bg text-ink-3 opacity-70"
                  : "border-line bg-card text-ink-2"
            }`}
          >
            <span
              className={`flex size-5 items-center justify-center rounded text-[9px] font-extrabold ${
                key === active ? "bg-black/10 text-ink" : "bg-gray-bg text-ink-2"
              }`}
            >
              {p.ic}
            </span>
            {p.name}
            {locked && <ProLockBadge tooltip="Ganti ke platform ini, atau upgrade ke Pro buat pakai keduanya" />}
          </button>
        );
      })}
    </div>
  );
}
