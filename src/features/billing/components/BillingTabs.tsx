export type BillingTab = "overview" | "packages";

export function BillingTabs({
  active,
  onChange,
}: {
  active: BillingTab;
  onChange: (tab: BillingTab) => void;
}) {
  const tabs: { key: BillingTab; label: string }[] = [
    { key: "overview", label: "Ringkasan" },
    { key: "packages", label: "Paket Tersedia" },
  ];
  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`rounded-lg border px-3 py-2 text-[12.5px] font-semibold ${
            t.key === active ? "border-accent bg-accent text-ink" : "border-line bg-card text-ink-2"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
